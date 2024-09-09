# Survey Builder Architecture

## Overview

<!-- [Provide an overview of the addon architecture] -->
This Addon provides the ability to add survey templates, the user can manage the template in the settings.
each template can add sections and questions (under each section).
* section must have key and title fields, description is optional.
* question must have key and title fields, description is optional. all other properties are change bu the question type.
the user can set the sections and the questions order by drag & drop, add logic if the question should appear or not with if statement logic and more...

---

## Infrastructure

<!-- [Provide any special infrastructue the addon uses (eg. dedicated lambda etc.) and explain their usage] -->
- The Survey Builder Addon loads the saved survey model and the saved survey template combine.
- Use PFS for attachments (images and signatures).

---

## Data Model

<!-- [Provide any data models used by the addon (eg. ADAL tables etc.)] -->
Working with UDC that saved as generic resource for this API [read more..](https://apidesign.pepperi.com/generic-resources/introduction).
* Draft survey templates are saved in ADAL.
* Attachments (images and signatures) are saved in PFS.

---

## PNS Usage

<!-- [Provide any PNS subscriptions or publishes done by the addon] -->

---

## Relations

<!-- [Provide any relations provided by the addon, or that the addon subscribes to ] -->
- SettingsBlock - Used for load the pages settings.
- DataImportResource - Used for importing the survey template by the DIMX addon [read more..](https://apidesign.pepperi.com/addon-relations/addons-link-table/relation-names/data-import).
- DataExportResource - Used for exporting the survey template by the DIMX addon [read more...](https://apidesign.pepperi.com/addon-relations/addons-link-table/relation-names/export-data-source).
- PageBlock - Used for load the survey template inside a page [read more..](https://apidesign.pepperi.com/addon-relations/addons-link-table/relation-names/page-block).

---

## Topics

<!-- [Provide a list of sustantial topics in the addons design and supply information regarding each topic] -->

### Survey events
#### High Level

<!-- [Proivde a high level review of the topic] -->
Provide a lifecycle to a survey, this way the survey can raise events such as survey-field-change or survey-question-change or survey-question-click to the CPI side and CPI 
is calculate all the changes and return the new data to the UI.
[read more..](https://apidesign.pepperi.com/headless-on-client/survey-events).

<!-- #### Key Classes: -->
<!-- - `Topic1Factory` - Creates all the classes for topic1 -->

<!-- #### Diagram -->

<!-- [Provide any diagrams relevant to topic1] -->
