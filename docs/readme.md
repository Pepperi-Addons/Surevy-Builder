# Themes

## High Level

<!-- [Provide a high level overview of the addons. What features does it provides, how does it interact with other addons etc. ] -->
This Addon provides the ability to add survey templates, the user can config the questions type & order etc.
in runtime the user can set the survey answers in the published template questions.

---

## Releases
| Version | Description | Migration |
|-------- |------------ |---------- |
<!-- | 0.1     | [The version description] | [specify any migrations introduced in this version] | -->
| 0.9   | Support attachments | - |

---

## Deployment

<!-- [Specify any manual or non-manual deployment specific to this addon] -->
- After a Pull Request is merged into a release branch, a version will be published marked as available.

---

## Debugging

<!-- [Specify any debugging instructions specific to this addon] -->
- #### Client side: 
    To debug your addon with developer toolbar (chrome or any other browser dev tool).

    - Addon debugging (Edit & Create):
        - Open terminal --> change to client-side --> Start your addon with npm start.
        Run the webapp application go to Settings --> Sales Activities --> Survey Builder (Beta).
        Add ?dev=true to the browser query (URL params). add debugger on your typescript code and reload the page. notice that dev=true will work only if your addon runs on port 4400.

- #### Server side: 
    - To debug your addon with `Visual Studio Code`, set the RUN mode to 'Launch API Server', press `F5` or `Run->Start Debugging`.
    You can then checkout your *API* at http://localhost:4500/api/foo. Be sure to supply a JWT for it to work.

- #### CPI side:
    - To debug the CPI side with `Visual Studio Code`, open the PEPPERI catalist application (simulator), login to the user that you want to debug, add 'debugger' at the cpi code,  set the RUN mode to 'Launch CPINode debugger Server', press `F5` or `Run->Start Debugging`. 

---

## Testing

<!-- [Specify any testing instructions specific to this addon] -->

---

## Dependencies

| Addon | Usage |
|-------- |------------ |
<!-- | [Add any dependecies on other addons]  | [Specify the reason for this dependency]  | -->
| survey | the survey model that saved combine to the template | 
| UDC | to use the model of the user define collections | 
| generic_resource | inherit from base (generic resource design) | 
| pfs | save attachments with the PFS architecture | 
| nebula | for sync to the clients | 

<!-- "webapp": "18.0.20",
"adal": "1.4.77",
"nebula": "0.4.61",
"cpi_node": "1.2.11",
"cpapi": "9.6.10",
"core": "0.6.35",
"core_resources": "0.6.20",
"cpi-data": "0.6.9",
"udc": "0.8.32",
"resource_list": "0.7.69",
"abstract_activities": "0.0.6",
"survey": "0.5.12",
"pages": "3.1.1",
"slugs": "1.0.26",
"user_events": "0.5.7",
"scripts": "0.6.2",
"sync": "0.2.57",
"generic_resource": "0.6.2",
"pfs": "1.3.29",
"pepperi_pack": "1.1.6" -->

---

## APIs

<!-- [Provide links to API documentation] -->
The API is hosted on the [Pepperi API Design Center](https://apidesign.pepperi.com/survey)

[Postman Collection](./addon.postman_collection.json)

---

## Limitations

<!-- [Provide information regarding hard & soft limits] -->
Soft & Hard limit of survey questions - number of 100 questions.

---

## Architecture
see: [Architecture](./architecture.md)

---

## Known issues

<!-- - [provide any information regarding known issues (bugs, qwerks etc.) in the addon]  -->

---

## Future Ideas & Plans

<!-- - [provide any knowledge regarding meaningful future plans for the addons (features, refactors etc.)] -->
