// QR Check-in Services (Firebase removed - using localStorage for demo)

// Mock data storage in localStorage
const getMockCheckIns = () => {
  try {
    const stored = localStorage.getItem('fog_mock_checkins');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveMockCheckIns = (checkIns) => {
  try {
    localStorage.setItem('fog_mock_checkins', JSON.stringify(checkIns));
  } catch (error) {
    console.error('Error saving mock check-ins:', error);
  }
};

// QR Check-in Services
export const qrService = {
  // Generate a unique QR code for an event
  async generateEventQR(eventId, eventData) {
    try {
      const qrData = {
        eventId,
        eventTitle: eventData.title,
        eventDate: eventData.date,
        eventTime: eventData.time,
        generatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        isActive: true
      };

      // Store in localStorage
      const qrCodes = JSON.parse(localStorage.getItem('fog_event_qrs') || '{}');
      qrCodes[eventId] = qrData;
      localStorage.setItem('fog_event_qrs', JSON.stringify(qrCodes));

      return qrData;
    } catch (error) {
      console.error('Error generating event QR:', error);
      throw error;
    }
  },

  // Get QR data for an event
  async getEventQR(eventId) {
    try {
      const qrCodes = JSON.parse(localStorage.getItem('fog_event_qrs') || '{}');
      return qrCodes[eventId] || null;
    } catch (error) {
      console.error('Error getting event QR:', error);
      return null;
    }
  },

  // Process a check-in
  async processCheckIn(userId, qrData, userProfile) {
    try {
      const checkInData = {
        id: `checkin-${Date.now()}`,
        userId,
        eventId: qrData.eventId,
        eventTitle: qrData.eventTitle,
        checkInTime: new Date().toISOString(),
        userProfile: {
          name: userProfile.name || 'Anonymous',
          email: userProfile.email || '',
          phone: userProfile.phone || ''
        },
        status: 'checked-in'
      };

      const mockCheckIns = getMockCheckIns();
      
      // Check if already checked in
      const existingCheckIn = mockCheckIns.find(
        checkIn => checkIn.userId === userId && checkIn.eventId === qrData.eventId
      );
      
      if (existingCheckIn) {
        throw new Error('Already checked in to this event');
      }

      // Add to mock data
      mockCheckIns.push(checkInData);
      saveMockCheckIns(mockCheckIns);

      return checkInData;
    } catch (error) {
      console.error('Error processing check-in:', error);
      throw error;
    }
  },

  // Get user's check-in for a specific event
  async getUserCheckIn(userId, eventId) {
    try {
      const mockCheckIns = getMockCheckIns();
      return mockCheckIns.find(
        checkIn => checkIn.userId === userId && checkIn.eventId === eventId
      ) || null;
    } catch (error) {
      console.error('Error getting user check-in:', error);
      return null;
    }
  },

  // Get all check-ins for an event
  async getEventCheckIns(eventId) {
    try {
      const mockCheckIns = getMockCheckIns();
      return mockCheckIns
        .filter(checkIn => checkIn.eventId === eventId)
        .sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime));
    } catch (error) {
      console.error('Error getting event check-ins:', error);
      return [];
    }
  },

  // Update event attendance count
  async updateEventAttendance(eventId) {
    try {
      const checkIns = await this.getEventCheckIns(eventId);
      return checkIns.length;
    } catch (error) {
      console.error('Error updating event attendance:', error);
      return 0;
    }
  },

  // Get user's check-in history
  async getUserCheckInHistory(userId) {
    try {
      const mockCheckIns = getMockCheckIns();
      return mockCheckIns
        .filter(checkIn => checkIn.userId === userId)
        .sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime));
    } catch (error) {
      console.error('Error getting user check-in history:', error);
      return [];
    }
  },

  // Validate QR code data
  validateQRData(qrData) {
    if (!qrData || !qrData.eventId) {
      return { valid: false, error: 'Invalid QR code data' };
    }

    if (qrData.expiresAt && new Date(qrData.expiresAt) < new Date()) {
      return { valid: false, error: 'QR code has expired' };
    }

    if (!qrData.isActive) {
      return { valid: false, error: 'QR code is not active' };
    }

    return { valid: true };
  }
};
