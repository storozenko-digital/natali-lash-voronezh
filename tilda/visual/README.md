# Natali Lash visual Tilda page

Published homepage: https://natali-lash-vrn.tilda.ws/

Project 44730409. New homepage 304071609. Original HTML page 303238509 remains in the project for rollback. The native page also has the alias `visual`.

## Native content records

| Record | Template | Content |
| --- | --- | --- |
| 4766612301 | ME301N / T1272 | Menu, logo, links, booking button |
| 4761864101 | AB605 / T478 | Portrait, headline, biography, button |
| 4766245901 | GL01 / T670 | Qualification collage |
| 4765971901 | GL01 / T670 | 47 work images |
| 4766045301 | GL01 / T670 | Two price graphics |
| 4761668901 | GL01 / T670 | 36 lash catalog images |
| 4761147801 | GL01 / T670 | 30 review images, heading Отзывы клиентов |
| 4766352601 | TE220 / T772 | Three promotion cards, photos, descriptions and links |
| 4766441201 | GL01 / T670 | Upright chair, reclined chair, map and address |
| 4766568701 | TX01 | Contacts and messenger links |
| 4766711301 | TX01 | Booking introduction |
| 4766718901 | T123 | Calendar integration from booking-t123.html |
| 4766745901 | TX01 | Footer, name, INN and legal page links |
| 4761344601 | T123 | Layout and books from books-t123.html |

Photos have been uploaded to Tilda CDN. Helper scripts read the published native record content; they do not require a separate hard-coded image list. Owners edit Content in the native galleries and publish the page. Books are identified by record IDs, so headline changes do not break them. Do not delete and recreate the native records without updating the helper IDs.

The promotion presentation reads image, title, description and button links from native TE220 cards and creates isolated image buttons. This avoids the template's full-card messenger link interfering with the image zoom. Hidden native wrappers require a specific `display:none!important` override because the template wrapper otherwise uses an important display rule. Button labels must come from `.t-btnflex__text`, excluding embedded style text.

## Validation on 14 October 2026

- UI verified saved helper code exactly matches both local HTML files before publication.
- Tilda reported successful publication. Main URL renders native record 4766612301 and the new biography, works, prices, books, promotions, studio and footer.
- Both books advanced from 1–2 to 3–4; review zoom opened successfully.
- Birthday promotion image opened in an isolated modal after replacing the native card click surface.
- Native heading was edited directly to Отзывы клиентов and published, exercising real owner text editing.
- Responsive iframe widths 320, 375, 768 and 1440 were inspected. At browser content widths 305, 360, 753 and 1425, body scroll width equals client width. Mobile header reduced from 285 to 108px by setting the menu list flex direction explicitly to row.
- No actual appointment was created. The Cal.com event and availability were not changed during this migration. Website form retains new/returning selection, required separate personal consent, optional unchecked marketing consent and no duplicate phone/email fields.
- Browser policy prevents opening VK; messenger destinations are verified from stored link attributes, not claimed as end-to-end navigation checks.

## Scope and rollback

Price values remain part of two graphics; replace a graphic to change its values. The five separate rules/legal/consent pages remain in their original HTML format and are not edited in the native homepage. Rules wording was not changed. Advanced books/layout and calendar remain two service T123 blocks; regular content is editable without opening them.

To roll back, select page 303238509 in Project Settings → Homepage and publish the desired saved version. Avoid Publish All while restoring because draft changes may exist on other pages. Keep the original approved HTML exports under `tilda/` and the GitHub Pages build under `dist/`.

Internal responsive QA page 303661409 uses `/visual` as iframe target after this migration. It is not a client content page and includes an old test block that is not part of the homepage.
