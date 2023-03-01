import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import algoliasearch from 'algoliasearch'

export default class DeviceRegistry {
    constructor() {
        this.app = initializeApp()
        this.db = getFirestore(this.app)
    }

    async registerDevice(device) {
        let deviceRef = this.db.collection('devices').doc(device.name)
        let deviceDoc = await deviceRef.get()

        if (!deviceDoc.exists) {
            await deviceRef.set({
                owner: device.owner,
                protocol_version: device.protocol_version,
            })

            for (let command of device.commands) {
                await deviceRef.collection('commands').doc(command.name).set({
                    description: command.description,
                    params: command.params,
                })
            }

            return deviceRef
        }

        else {
            throw new Error(`Device ${device.name} already exists`)
        }
    }

    async listDevices() {
        let deviceDocs = await this.db.collection('devices').listDocuments()

        let devices = []

        for (let deviceDoc of deviceDocs.docs) {
            devices.push(deviceDoc.id)
        }

        return devices
    }

}   