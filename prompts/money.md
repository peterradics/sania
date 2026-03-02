## MONEY FOR CLIENTS
- for clients there will be money entries in the database (money table)

this is the money table export from pocketbase
[
    {
        "id": "pbc_2090446095",
        "listRule": null,
        "viewRule": null,
        "createRule": null,
        "updateRule": null,
        "deleteRule": null,
        "name": "money",
        "type": "base",
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
                "hidden": false,
                "id": "number494360628",
                "max": null,
                "min": null,
                "name": "value",
                "onlyInt": false,
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number"
            },
            {
                "cascadeDelete": false,
                "collectionId": "pbc_2442875294",
                "hidden": false,
                "id": "relation3343123541",
                "maxSelect": 1,
                "minSelect": 0,
                "name": "client",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "relation"
            },
            {
                "hidden": false,
                "id": "date570297801",
                "max": "",
                "min": "",
                "name": "endofterm",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "date"
            },
            {
                "autogeneratePattern": "",
                "hidden": false,
                "id": "text2363381545",
                "max": 0,
                "min": 0,
                "name": "type",
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
                "id": "text1032740943",
                "max": 0,
                "min": 0,
                "name": "parent",
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
        ],
        "indexes": [],
        "system": false
    }
]


- under the form dashboard/list/[id]  create a new form under client form for making money entries for the selected client
- create fields for this form by the json export above
- validate with zod
- Toast message on succesful saving
- after saving stay on the form, no redirect
- under the money form there should be  list with money entries for the client
- money type can be deposit, withdraw
- if it is a withdraw there should be a select with all the deposits to withdraw from -> (mone table parent field), the parent field should contains the deposit's id where the withdraw subtracted from
- under the money list there should be a summary of money entries (sum of values)

- in the list of the clients, dashboard/clients/list there should be a new column in the table with the sum of money for the client




 