//npm install express
//npm install body-parser

'use strict';
var express = require('express');
var bodyParser = require('body-parser')

const PORT = 8080

/// Sensor module
module.exports = {
    messageBus: null,
    configuration: null,
    devices: {},

    create: function (messageBus, configuration) {
        this.messageBus = messageBus;
        this.configuration = configuration;

        var app = express();
        app.use(bodyParser.json())

        // GET /
        app.get("/", function(req, res){
            res.send('Welcome to our field gateway batch & compression demo.');
        });

        // POST /messages
        app.post("/messages", function(req, res){
            if (!req.body) return res.sendStatus(400)
            
            // mock protocol translation 
            var deviceId = req.body.deviceId
            var deviceName = req.body.deviceName
            var deviceType = req.body.deviceType
            var payload = JSON.stringify(req.body.data)

            // publish message to gateway bus
            messageBus.publish({
                properties: {
                    'sensorType': deviceType,
                    'name' : deviceName,
                    'id' : deviceId
                },
                content: new Uint8Array(Buffer.from(payload))
            });

            res.sendStatus(200)
        });
        
        // 404
        app.use(function(req, res, next) {
            res.status(404).send('Resource not Found.');
        });

        // 500
        app.use(function(err, req, res, next) {
            console.error(err.stack);
            res.status(500).send('Internal Server Error.');
        });

        // Start
        app.listen(PORT, function(){
            console.log("Started server on port %s", PORT)
        });

        return true;
    },
    
    receive: function(message) {
    },

    destroy: function() {
        console.log('receiver.destroy');
    }
};