const express = require('express');
const router = express.Router();

const schema = require('../models/schema');

// get all records
router.get('/', async (req, res) => {
    try {
        const records = await schema.find();
        res.json(records);
    } catch (error) {
        res.status(500).send('Error retrieving records: ' + error.message);
    }
});

// get a single record by id
router.get('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const record = await schema.findById(id);
        if (!record) {
            return res.status(404).send('Record not found');
        }
        res.json(record);
    } catch (error) {
        res.status(500).send('Error retrieving record: ' + error.message);
    }
});
// create a new record
router.post('/', async (req, res) => {
    const newRecord = req.body;
    try {
        const record = await schema.create(newRecord);
        res.status(201).json(record);
    } catch (error) {
        res.status(400).send('Error creating record: ' + error.message);
    }
});
// update a record by id
router.put('/:id', async (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;
    try {
        const record = await schema.findByIdAndUpdate(id, updatedData, { new: true });
        if (!record) {
            return res.status(404).send('Record not found');
        }
        res.json(record);
    } catch (error) {
        res.status(400).send('Error updating record: ' + error.message);
    }
});
// delete a record by id
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const record = await schema.findByIdAndDelete(id);
        if (!record) {
            return res.status(404).send('Record not found');
        }
        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        res.status(500).send('Error deleting record: ' + error.message);
    }
});

module.exports = router;