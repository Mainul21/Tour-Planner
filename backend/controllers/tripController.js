const Trip = require('../models/Trip');
const User = require('../models/User');

// ... (keep existing functions, add these new ones)

// Add a member to trip
exports.addMember = async (req, res) => {
  try {
    const { id: tripId } = req.params;
    const { email } = req.body;

    // Verify user is creator
    const trip = await Trip.findById(tripId);
    if (!trip || trip.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only trip creator can add members' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already a member
    if (trip.members.some(m => m.userId.toString() === user._id.toString())) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    // Add member
    trip.members.push({
      userId: user._id,
      role: 'member'
    });

    await trip.save();
    res.json({
      message: 'Member added successfully',
      trip: await trip.populate('members.userId', 'name email')
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Remove a member from trip
exports.removeMember = async (req, res) => {
  try {
    const { id: tripId, memberId } = req.params;

    // Verify user is creator
    const trip = await Trip.findById(tripId);
    if (!trip || trip.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only trip creator can remove members' });
    }

    // Can't remove creator
    if (trip.userId.toString() === memberId) {
      return res.status(400).json({ message: 'Cannot remove trip creator' });
    }

    // Remove member
    trip.members = trip.members.filter(m => m.userId.toString() !== memberId);
    await trip.save();

    res.json({
      message: 'Member removed successfully',
      trip: await trip.populate('members.userId', 'name email')
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get trip members
exports.getMembers = async (req, res) => {
  try {
    const { id: tripId } = req.params;

    const trip = await Trip.findById(tripId).populate('members.userId', 'name email');
    
    if (!trip || (trip.userId.toString() !== req.userId && !trip.members.some(m => m.userId.toString() === req.userId))) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json(trip.members);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};