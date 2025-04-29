const express = require('express');
const router = express.Router();
const { Target } = require('../models');
const { Op } = require('sequelize');

// Get all targets
router.get('/', async (req, res) => {
  try {
    const targets = await Target.findAll({
      order: [['name', 'ASC']]
    });
    res.json(targets);
  } catch (error) {
    console.error('Error fetching targets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific target
router.get('/:id', async (req, res) => {
  try {
    const target = await Target.findByPk(req.params.id);
    
    if (!target) {
      return res.status(404).json({ error: 'Target not found' });
    }
    
    res.json(target);
  } catch (error) {
    console.error('Error fetching target:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new target
router.post('/', async (req, res) => {
  try {
    const { name, email, department } = req.body;
    
    // Check if email already exists
    const existingTarget = await Target.findOne({ where: { email } });
    if (existingTarget) {
      return res.status(400).json({ error: 'Email address already exists' });
    }
    
    const target = await Target.create({
      name,
      email,
      department
    });
    
    res.status(201).json(target);
  } catch (error) {
    console.error('Error creating target:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a target
router.put('/:id', async (req, res) => {
  try {
    const { name, email, department } = req.body;
    
    const target = await Target.findByPk(req.params.id);
    if (!target) {
      return res.status(404).json({ error: 'Target not found' });
    }
    
    // Check if email is being changed and already exists
    if (email !== target.email) {
      const existingTarget = await Target.findOne({ where: { email } });
      if (existingTarget) {
        return res.status(400).json({ error: 'Email address already exists' });
      }
    }
    
    // Update target
    await target.update({
      name: name || target.name,
      email: email || target.email,
      department: department !== undefined ? department : target.department
    });
    
    res.json(target);
  } catch (error) {
    console.error('Error updating target:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a target
router.delete('/:id', async (req, res) => {
  try {
    const target = await Target.findByPk(req.params.id);
    if (!target) {
      return res.status(404).json({ error: 'Target not found' });
    }
    
    await target.destroy();
    
    res.json({ message: 'Target deleted successfully' });
  } catch (error) {
    console.error('Error deleting target:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Import multiple targets
router.post('/import', async (req, res) => {
  try {
    const { targets } = req.body;
    
    if (!Array.isArray(targets) || targets.length === 0) {
      return res.status(400).json({ error: 'Invalid target data' });
    }
    
    // Process targets and filter out existing emails
    const existingEmails = await Target.findAll({
      where: {
        email: {
          [Op.in]: targets.map(t => t.email)
        }
      },
      attributes: ['email']
    });
    
    const existingEmailSet = new Set(existingEmails.map(t => t.email));
    const newTargets = targets.filter(t => !existingEmailSet.has(t.email));
    
    if (newTargets.length === 0) {
      return res.json({ message: 'No new targets to import' });
    }
    
    // Insert new targets
    await Target.bulkCreate(newTargets);
    
    res.status(201).json({
      message: `Successfully imported ${newTargets.length} targets`,
      skipped: targets.length - newTargets.length
    });
  } catch (error) {
    console.error('Error importing targets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;