const bcrypt = require('bcrypt');
const { User } = require('../models');

async function seedAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      where: { username: 'admintud' }
    });

    if (!existingAdmin) {
      // Create admin user with hashed password
      const hashedPassword = await bcrypt.hash('admintud', 10);
      
      await User.create({
        username: 'admintud',
        password: hashedPassword,
        role: 'admin',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}

module.exports = seedAdminUser;