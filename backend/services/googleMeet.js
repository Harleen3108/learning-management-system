const { google } = require('googleapis');
const { v4: uuidv4 } = require('uuid');

/**
 * Service to handle Google Meet link generation using Google Calendar API
 */
class GoogleMeetService {
    constructor() {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
    }

    /**
     * Generate Auth URL for Instructor to link Google account
     */
    getAuthUrl() {
        const scopes = ['https://www.googleapis.com/auth/calendar.events'];
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });
    }

    /**
     * Get tokens from code
     */
    async getTokens(code) {
        const { tokens } = await this.oauth2Client.getToken(code);
        return tokens;
    }

    /**
     * Create a Google Meet meeting
     * @param {Object} tokens - Instructor's OAuth tokens
     * @param {Object} eventDetails - { title, startTime, endTime }
     */
    async createMeeting(tokens, eventDetails) {
        this.oauth2Client.setCredentials(tokens);
        const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

        const event = {
            summary: eventDetails.title,
            start: { dateTime: eventDetails.startTime, timeZone: 'UTC' },
            end: { dateTime: eventDetails.endTime, timeZone: 'UTC' },
            conferenceData: {
                createRequest: {
                    requestId: uuidv4(),
                    conferenceSolutionKey: { type: 'hangoutsMeet' }
                }
            }
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
            conferenceDataVersion: 1
        });

        return {
            meetingLink: response.data.hangoutLink,
            eventId: response.data.id
        };
    }
}

module.exports = new GoogleMeetService();
