"""Build scoped T123 fragments from the existing static site. No dependencies."""
from pathlib import Path
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
OUT = ROOT / 'tilda'
ASSETS = 'https://storozenko-digital.github.io/natali-lash-voronezh/assets/'
PAGES = ('index', 'privacy', 'legal', 'rules', 'consent', 'marketing-consent')


def split_selectors(value):
    result, start, depth, quote = [], 0, 0, None
    for i, char in enumerate(value):
        if quote:
            if char == quote and (i == 0 or value[i-1] != '\\'):
                quote = None
        elif char in '\"\'':
            quote = char
        elif char in '([':
            depth += 1
        elif char in ')]':
            depth -= 1
        elif char == ',' and not depth:
            result.append(value[start:i].strip())
            start = i+1
    result.append(value[start:].strip())
    return result


def scope_css(css, scope):
    """Scope rule selectors, recursing into media rules but leaving keyframes alone."""
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    result, cursor = [], 0
    while cursor < len(css):
        opening = css.find('{', cursor)
        if opening == -1:
            result.append(css[cursor:])
            break
        selector = css[cursor:opening].strip()
        depth, pos, quote = 1, opening+1, None
        while depth:
            char = css[pos]
            if quote:
                if char == quote and css[pos-1] != '\\':
                    quote = None
            elif char in '\"\'':
                quote = char
            elif char == '{':
                depth += 1
            elif char == '}':
                depth -= 1
            pos += 1
        body = css[opening+1:pos-1]
        if selector.startswith(('@media', '@supports', '@container')):
            result.append(selector+'{'+scope_css(body, scope)+'}')
        elif selector.startswith('@'):
            result.append(selector+'{'+body+'}')
        else:
            selectors = []
            for item in split_selectors(selector):
                if item in (':root', 'html', 'body'):
                    selectors.append(scope)
                elif item == '*':
                    selectors.extend((scope, scope+' *'))
                else:
                    selectors.append(scope+' '+item)
            result.append(','.join(selectors)+'{'+body+'}')
        cursor = pos
    return '\n'.join(result)


def build(name):
    source = (DIST / (name+'.html')).read_text()
    css = '\n'.join(re.findall(r'<style[^>]*>(.*?)</style>', source, re.S))
    for href in re.findall(r'<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"', source):
        path = DIST / href.split('?')[0]
        if path.is_file():
            css += '\n' + path.read_text()
    body = re.search(r'<body[^>]*>(.*?)</body>', source, re.S).group(1)
    for script in ('gallery.js', 'booking.js'):
        body = re.sub(r'<script src="'+re.escape(script)+r'(?:\?[^\"]*)?"></script>', lambda _: '<script>'+ (DIST/script).read_text()+'</script>', body)
    scope = '#natali-tilda-'+name
    css = css.replace('animation:turn ', 'animation:natali-turn ').replace('@keyframes turn', '@keyframes natali-turn')
    css = scope_css(css, scope)
    # Establish a positioning context and explicit defaults for Tilda's global styles.
    css = scope+'{position:relative;isolation:isolate;text-align:left}\n'+scope+' p{margin:1em 0}\n'+css
    body = body.replace('assets/', ASSETS)
    for page in PAGES:
        target = '/' if page == 'index' else '/'+page
        body = re.sub(r'href="'+re.escape(page)+r'\.html(?:\?[^\"]*)?"', 'href="'+target+'"', body)
    if name == 'privacy':
        body = body.replace('Сайт размещён на GitHub Pages; поставщик хостинга может автоматически получать технические сведения о соединении в соответствии со своей политикой.', 'Сайт размещён на Tilda; фотографии загружаются с GitHub Pages. Поставщики этих сервисов могут автоматически получать технические сведения о соединении в соответствии со своими политиками.')
    # Keep each block's script declarations private.
    body = re.sub(r'<script>(.*?)</script>', lambda m: '<script>(() => {\n'+m.group(1)+'\n})();</script>', body, flags=re.S)
    fragment = '<style>\n'+css+'\n</style>\n<div id="natali-tilda-'+name+'">'+body+'</div>\n'
    (OUT / (name+'-t123.txt')).write_text(fragment)
    title = re.search(r'<title>(.*?)</title>', source).group(1)
    preview = '<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><style>body{margin:0}</style></head><body>'+fragment+'</body></html>'
    (OUT / (name+'-preview.html')).write_text(preview)


if __name__ == '__main__':
    OUT.mkdir(exist_ok=True)
    for name in PAGES:
        build(name)
    (OUT/'README.txt').write_text('''Natali Lash — перенос в Tilda

1. Во время пробного периода создайте пустую страницу и добавьте блок T123 (HTML-код).
2. Откройте index-t123.txt, скопируйте содержимое целиком в поле кода T123.
3. Установите нулевые верхний и нижний отступы блока. Опубликуйте страницу.
4. Создайте страницы privacy, legal, rules, consent и marketing-consent, вставьте соответствующие файлы в блоки T123 и опубликуйте.
5. В настройках основной страницы укажите заголовок «Natali Lash — наращивание ресниц в Воронеже».
6. Проверьте опубликованную страницу: книги, ссылки, календарь, запись и мобильный вид. В редакторе JavaScript может не исполняться.

Календарь использует настоящий Cal.com аккаунт nklimenk26. Расписание изменяется в Cal.com, а не в коде сайта.
Кнопки «Записаться» ведут к календарю; кнопки связи остаются в личных сообщениях MAX; канал MAX сохранён отдельно.
Фотографии загружаются с GitHub Pages: storozenko-digital.github.io/natali-lash-voronezh/assets/. Этот репозиторий нельзя удалять до переноса фотографий на новый хостинг. Все исходные фотографии находятся в dist/assets. После загрузки фотографий на Tilda нужно заменить их адреса в коде.
HTML-блок T123 требует платного тарифа после окончания пробного периода Tilda. Бесплатный тариф не сохраняет его работоспособность.
Перенос через T123 сохраняет исходный код: текст и фото редактируются в HTML, а не как стандартные блоки Tilda.
Реальное бронирование, уведомления и отсутствие двойной записи нужно проверить тестовой записью после публикации.
''')
    print(OUT)
