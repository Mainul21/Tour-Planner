const Activity = require('../models/Activity');
const Trip = require('../models/Trip');
const ActivityChangeRequest = require('../models/ActivityChangeRequest');

// Helper function to check if user is trip creator
const isCreator = (trip, userId) => {
  return trip.userId.toString() === userId;
};

// Helper function to check if user is member
const isMember = (trip, userId) => {
  return trip.members.some(m => m.userId.toString() === userId);
};

// Get all activities for a trip
exports.getActivities = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Verify trip belongs to user or user is a member
    const trip = await Trip.findById(tripId);
    if (!trip || (!isCreator(trip, req.userId) && !isMember(trip, req.userId))) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const activities = await Activity.find({ tripId }).sort({ startTime: 1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single activity
exports.getActivity = async (req, res) => {
  try {
    const { tripId, activityId } = req.params;

    // Verify trip belongs to user or user is a member
    const trip = await Trip.findById(tripId);
    if (!trip || (!isCreator(trip, req.userId) && !isMember(trip, req.userId))) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const activity = await Activity.findById(activityId);
    if (!activity || activity.tripId.toString() !== tripId) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    res.json(activity);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new activity
exports.createActivity = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { title, description, location, startTime, endTime, notes, category } = req.body;

    // Verify trip exists and user is member
    const trip = await Trip.findById(tripId);
    if (!trip || (!isCreator(trip, req.userId) && !isMember(trip, req.userId))) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Validation
    if (!title || !location || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ message: 'Start time must be before end time' });
    }

    // If user is creator, create activity directly
    if (isCreator(trip, req.userId)) {
      const activity = new Activity({
        title,
        description,
        location,
        startTime,
        endTime,
        notes,
        category,
        tripId
      });

      await activity.save();
      return res.status(201).json({ 
        message: 'Activity created successfully',
        activity 
      });
    }

    // If user is member, create a change request instead
    const changeRequest = new ActivityChangeRequest({
      tripId,
      requestedBy: req.userId,
      changeType: 'create',
      proposedChanges: {
        title,
        description,
        location,
        startTime,
        endTime,
        notes,
        category
      }
    });

    await changeRequest.save();
    res.status(201).json({
      message: 'Activity creation request submitted for approval',
      changeRequest
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update an activity
exports.updateActivity = async (req, res) => {
  try {
    const { tripId, activityId } = req.params;

    // Verify trip exists and user is member
    const trip = await Trip.findById(tripId);
    if (!trip || (!isCreator(trip, req.userId) && !isMember(trip, req.userId))) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const activity = await Activity.findById(activityId);
    if (!activity || activity.tripId.toString() !== tripId) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // If user is creator, update directly
    if (isCreator(trip, req.userId)) {
      if (req.body.title) activity.title = req.body.title;
      if (req.body.description) activity.description = req.body.description;
      if (req.body.location) activity.location = req.body.location;
      if (req.body.startTime) activity.startTime = req.body.startTime;
      if (req.body.endTime) activity.endTime = req.body.endTime;
      if (req.body.notes) activity.notes = req.body.notes;
      if (req.body.category) activity.category = req.body.category;
      activity.updatedAt = Date.now();

      await activity.save();
      return res.json({ 
        message: 'Activity updated successfully',
        activity 
      });
    }

    // If user is member, create a change request
    const changeRequest = new ActivityChangeRequest({
      activityId,
      tripId,
      requestedBy: req.userId,
      changeType: 'update',
      proposedChanges: {
        title: req.body.title || activity.title,
        description: req.body.description || activity.description,
        location: req.body.location || activity.location,
        startTime: req.body.startTime || activity.startTime,
        endTime: req.body.endTime || activity.endTime,
        notes: req.body.notes || activity.notes,
        category: req.body.category || activity.category
      }
    });

    await changeRequest.save();
    res.status(201).json({
      message: 'Activity update request submitted for approval',
      changeRequest
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete an activity
exports.deleteActivity = async (req, res) => {
  try {
    const { tripId, activityId } = req.params;

    // Verify trip exists and user is member
    const trip = await Trip.findById(tripId);
    if (!trip || (!isCreator(trip, req.userId) && !isMember(trip, req.userId))) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const activity = await Activity.findById(activityId);
    if (!activity || activity.tripId.toString() !== tripId) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // If user is creator, delete directly
    if (isCreator(trip, req.userId)) {
      await Activity.findByIdAndDelete(activityId);
      return res.json({ message: 'Activity deleted successfully' });
    }

    // If user is member, create a change request
    const changeRequest = new ActivityChangeRequest({
      activityId,
      tripId,
      requestedBy: req.userId,
      changeType: 'delete'
    });

    await changeRequest.save();
    res.status(201).json({
      message: 'Activity deletion request submitted for approval',
      changeRequest
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get pending change requests (creator only)
exports.getPendingRequests = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Verify user is creator
    const trip = await Trip.findById(tripId);
    if (!trip || !isCreator(trip, req.userId)) {
      return res.status(403).json({ message: 'Only trip creator can view requests' });
    }

    const requests = await ActivityChangeRequest.find({
      tripId,
      status: 'pending'
    }).populate('requestedBy', 'name email');

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve a change request (creator only)
exports.approveChangeRequest = async (req, res) => {
  try {
    const { tripId, requestId } = req.params;

    // Verify user is creator
    const trip = await Trip.findById(tripId);
    if (!trip || !isCreator(trip, req.userId)) {
      return res.status(403).json({ message: 'Only trip creator can approve requests' });
    }

    const changeRequest = await ActivityChangeRequest.findById(requestId);
    if (!changeRequest || changeRequest.tripId.toString() !== tripId) {
      return res.status(404).json({ message: 'Change request not found' });
    }

    if (changeRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Apply the changes based on type
    if (changeRequest.changeType === 'create') {
      const activity = new Activity({
        ...changeRequest.proposedChanges,
        tripId
      });
      await activity.save();
    } else if (changeRequest.changeType === 'update') {
      const activity = await Activity.findById(changeRequest.activityId);
      Object.assign(activity, changeRequest.proposedChanges);
      activity.updatedAt = Date.now();
      await activity.save();
    } else if (changeRequest.changeType === 'delete') {
      await Activity.findByIdAndDelete(changeRequest.activityId);
    }

    // Update change request status
    changeRequest.status = 'approved';
    changeRequest.approvedBy = req.userId;
    changeRequest.respondedAt = Date.now();
    await changeRequest.save();

    res.json({
      message: 'Change request approved and applied',
      changeRequest
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject a change request (creator only)
exports.rejectChangeRequest = async (req, res) => {
  try {
    const { tripId, requestId } = req.params;
    const { rejectionReason } = req.body;

    // Verify user is creator
    const trip = await Trip.findById(tripId);
    if (!trip || !isCreator(trip, req.userId)) {
      return res.status(403).json({ message: 'Only trip creator can reject requests' });
    }

    const changeRequest = await ActivityChangeRequest.findById(requestId);
    if (!changeRequest || changeRequest.tripId.toString() !== tripId) {
      return res.status(404).json({ message: 'Change request not found' });
    }

    if (changeRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Update change request status
    changeRequest.status = 'rejected';
    changeRequest.approvedBy = req.userId;
    changeRequest.rejectionReason = rejectionReason || 'No reason provided';
    changeRequest.respondedAt = Date.now();
    await changeRequest.save();

    res.json({
      message: 'Change request rejected',
      changeRequest
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};