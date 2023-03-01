import os from 'os'
import express from 'express'
import fetch from 'node-fetch'

export default class HarmonyDevice {
    
    attrs = {}
    eventListeners = []
    eventRecipients = {}

    constructor(name, remote = false, hostAddress='0.0.0.0', port=5000, commandHandler=(params) => {}) {
        this.remote = remote
        this.name = name
        this.hostAddress = hostAddress
        this.port = port
        this.expressApp = express()
        this.commandHandler = commandHandler
    }

    summary() {
        let attrs = this.attrs

        if (this.remote) {
            attrs = this.listAttributes()
        }

        summary = `
Device Name: ${this.name}
Host Address: ${this.hostAddress}
Harmony Server Port: ${this.port}
Attributes: ${JSON.stringify(attrs)}
        `

        print(summary)
    }

    async makeRequest(path, params = {}) {
        let url = `http://${this.hostAddress}:${this.port}/${path}?`

        for (let key in params) {
            url += `${key}=${params[key]}&`
        }

        url = url.slice(0, -1)

        let fetchResult = await fetch(url)
        
        return fetchResult.json()
    }

    listAttributes() {
        let attrs = this.attrs
        if (this.remote) {
            attrs = this.makeRequest('attributes')['attributes']
        }

        return attrs
    }

    addAttribute(attributeClass) {
        attrInstance = new attributeClass()
        this.attrs[attrInstance.name] = attrInstance
    }

    addAttributes(attributeClasses) {
        for (let attributeClass in attributeClasses) {
            this.addAttribute(attributeClass)
        }
    }

    get(attributeName, params = {}) {
        if (this.remote) {
            params['attribute'] = attributeName
            return this.makeRequest('get', params)
        }

        return this.attrs[attributeName].getter(params)
    }

    set(attributeName, value, params = {}) {
        if (this.remote) {
            params['attribute'] = attributeName
            params['value'] = value
            return this.makeRequest('set', params)
        }

        return this.attrs[attributeName].setter(value, params)
    }

    command(params) {
        if (this.remote) {
            return this.makeRequest('command', params)
        }

        return this.commandHandler(params)
    }

    commandHandler(params) {
        //Run a command
    } 

    addListener(listener) {
        if (this.remote) {
            throw new Error('Cannot add listeners to remote devices')
        }

        listener.device.addRecipient(this, listener.event)
        self.eventListeners.push(listener)
    }

    addListeners(listeners) {
        for (let listener in listeners) {
            this.addListener(listener)
        }
    }

    addRecipient(device, event) {
        if (device instanceof HarmonyDevice) {
            if (this.eventRecipients[event] === undefined) {
                this.eventRecipients[event] = []
            }

            this.eventRecipients.push(device)

            if (this.remote) {
                this.makeRequest('recipients/add', {
                    'hostAddress': device.hostAddress,
                    'port': device.port,
                    'device': device.name,
                    'event': event
                })
            }
        }
    }

    emit(event) {
        if (this.remote) {
            throw new Error('Cannot emit events on remote devices')
        }

        for (let recipient in this.eventRecipients[event]) {
            recipient.receiveNotification(event)
        }
    }

    receiveNotification(event, data) {
        if (this.remote) {
            this.makeRequest('notify', {
                event,
                data
            })
        }
        else {
            for (let listener in this.eventListeners) {
                if (listener.event == event && listener.device == event['device']) {
                    listener.callback(data)
                }
            }
        }
    }   

    runServer() {
        if (this.remote) throw new Error('Cannot run remote devices')

        this.expressApp.get('/get', (req, res) => {
            if (req.query['attribute'] in this.attrs && this.attrs[req.query['attribute']].getter) {
                data = this.get(params['attribute'], params)
            } else {
                data = {
                    'error': `No getter exists for attribute ${req.query['attribute']}`
                }
            }

            res.send(data)
        })

        this.expressApp.get('/set', (req, res) => {
            if (req.query['attribute'] in this.attrs && this.attrs[req.query['attribute']].setter) {
                data = this.set(params['attribute'], params['value'], params)
            } else {
                data = {
                    'error': `No setter exists for attribute ${req.query['attribute']}`
                }
            }

            res.send(data)
        })

        this.expressApp.get('/attributes', (req, res) => {
            res.send({ 'attributes': this.attrs })
        })

        this.expressApp.get('/command', (req, res) => {
            let data = this.command(req.query)
            res.send(data)
        })

        this.expressApp.get('/notify', (req, res) => {
            if ((!'event' in req.query)) {
                res.send({ 'error': 'Event not specified' })
                return
            }

            this.receiveNotification(req.query['event'], req.query['data'])
            res.send({ 'success': true })
        })

        this.expressApp.get('/recipients/add', (req, res) => {
            if ((!'hostAddress' in req.query) || (!'device' in req.query) || (!'event' in req.query)) { 
                res.send({ 'error': 'Host address, device, or event not specified' })
                return
            }

            let device = new HarmonyDevice(req.query['device'], true, req.query['hostAddress'], req.query['port'])

            this.addRecipient(device, req.query['event'])

            res.send({ 'success': true })
        })

        this.expressApp.listen(this.port, () => {
            console.log('Harmony Server started on port ' + this.port)
        })
    }
}