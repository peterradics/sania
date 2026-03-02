## FIELDS INFORMATION
This information is from the pocketBase export
"fields": [
            {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text3208210256",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
            },
            {
                "autogeneratePattern": "",
                "hidden": false,
                "id": "text1549253650",
                "max": 0,
                "min": 0,
                "name": "name_first",
                "pattern": "",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text"
            },
            {
                "autogeneratePattern": "",
                "hidden": false,
                "id": "text225276887",
                "max": 0,
                "min": 0,
                "name": "name_last",
                "pattern": "",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text"
            },
            {
                "exceptDomains": null,
                "hidden": false,
                "id": "email3885137012",
                "name": "email",
                "onlyDomains": null,
                "presentable": false,
                "required": false,
                "system": false,
                "type": "email"
            },
            {
                "hidden": false,
                "id": "number3499437989",
                "max": null,
                "min": null,
                "name": "system_id",
                "onlyInt": false,
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number"
            },
            {
                "autogeneratePattern": "",
                "hidden": false,
                "id": "text428192878",
                "max": 0,
                "min": 0,
                "name": "adress_street",
                "pattern": "",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text"
            },
            {
                "autogeneratePattern": "",
                "hidden": false,
                "id": "text156487625",
                "max": 0,
                "min": 0,
                "name": "address_zip",
                "pattern": "",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text"
            },
            {
                "autogeneratePattern": "",
                "hidden": false,
                "id": "text1343738591",
                "max": 0,
                "min": 0,
                "name": "address_city",
                "pattern": "",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text"
            },
            {
                "autogeneratePattern": "",
                "hidden": false,
                "id": "text144064254",
                "max": 0,
                "min": 0,
                "name": "address_country",
                "pattern": "",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text"
            },
            {
                "autogeneratePattern": "",
                "hidden": false,
                "id": "text1329388006",
                "max": 0,
                "min": 0,
                "name": "birth_place",
                "pattern": "",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "date3845444698",
                "max": "",
                "min": "",
                "name": "birth_date",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "date"
            },
            {
                "autogeneratePattern": "",
                "hidden": false,
                "id": "text1795275867",
                "max": 0,
                "min": 0,
                "name": "phone_number",
                "pattern": "",
                "presentable": false,
                "primaryKey": false,
                "required": false,
                "system": false,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "autodate2990389176",
                "name": "created",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate3332085495",
                "name": "updated",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            }
        ]
        
        

## TASKS
create a route under dashboard/clients/new
under dahsboard/create/new implement the following:
- Create a form for creating a new client
- Validate the form inputs
- Save the new client to the database (PocketBase)
- Implement a success message for the user with Toast (Sonner in shadcdn-svelte)
- The form should have a submit button
- The form should be responsive
- Implement a loading spinner while the form is being submitted
- Implement a cancel button that redirects to the clients list page
- use the shadcdn-svelte library

## OTHER
use the 'npx shadcn-svelte@latest add <component name>' to add a component you decided to use
on the server side use zod to validate the form inputs
