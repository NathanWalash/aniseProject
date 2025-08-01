# 🔔 Notification System Implementation Guide

## Overview
This guide shows how to implement a comprehensive notification system that sends notifications to all DAO members when specific events occur (like creating claims, proposals, etc.). Each notification includes a link to the relevant content, timestamp, and explanation.

---

## 📋 Table of Contents
1. [Database Schema](#database-schema)
2. [Backend Implementation](#backend-implementation)
3. [Frontend Integration](#frontend-integration)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Example: Claim Creation Notifications](#example-claim-creation-notifications)
6. [Testing the System](#testing-the-system)

---

## 🗄️ Database Schema

### Firestore Structure
- **Collection**: `users/{userId}/notifications/{notificationId}`
- **Fields**:
  - `type`: Notification type (claim_created, proposal_created, vote_started, etc.)
  - `title`: Short title for the notification
  - `message`: Detailed message
  - `explanation`: Additional context/explanation
  - `read`: Boolean for read status
  - `createdAt`: Timestamp when created
  - `link`: Deep link to relevant screen
  - `daoAddress`: Related DAO address
  - `daoName`: Related DAO name
  - `relatedId`: ID of related item (claimId, proposalId, etc.)
  - `priority`: Priority level (low, medium, high)
  - `expiresAt`: Optional expiration timestamp

### Example Notification Data
- **Type**: claim_created
- **Title**: "New Claim Created"
- **Message**: "A new claim 'Emergency Fund Request' was created in 'Green Investors'"
- **Explanation**: "This claim is requesting £500 for emergency community repairs. All members can vote on this claim."
- **Link**: "/myanises/green-investors/claims/123"
- **Priority**: medium

---

## 🔧 Backend Implementation

### 1. Create Notification Service
**File**: `aniseBackend/src/services/notificationService.ts`

**Key Functions to Implement**:
- `sendToUser()`: Send notification to a single user
- `sendToDaoMembers()`: Send notification to all DAO members
- `markAsRead()`: Mark notification as read
- `deleteNotification()`: Delete notification

**Notes**:
- Use Firestore server timestamps for createdAt
- Handle errors gracefully with try-catch blocks
- Log successful notifications for debugging
- Use Promise.all() for sending to multiple users efficiently

### 2. Create Notification Controller
**File**: `aniseBackend/src/controllers/notificationController.ts`

**API Endpoints to Create**:
- `GET /api/notifications`: Get user's notifications
- `POST /api/notifications/:id/read`: Mark as read
- `DELETE /api/notifications/:id`: Delete notification

**Notes**:
- Add authentication middleware to all routes
- Support query parameters for filtering (limit, unreadOnly)
- Order notifications by createdAt descending
- Return proper error responses

### 3. Add Notification Routes
**File**: `aniseBackend/src/routes/notificationRoutes.ts`

**Notes**:
- Use Express Router
- Apply authentication middleware to all routes
- Export router for app integration

### 4. Update App Configuration
**File**: `aniseBackend/src/app.ts`

**Notes**:
- Import notification routes
- Mount at `/api/notifications` path
- Ensure proper middleware order

---

## 📱 Frontend Integration

### 1. Create Notification API Service
**File**: `aniseProject/src/services/notificationApi.ts`

**Functions to Implement**:
- `getNotifications()`: Fetch user notifications
- `markAsRead()`: Mark notification as read
- `deleteNotification()`: Delete notification

**Notes**:
- Use AsyncStorage for authentication tokens
- Handle API errors gracefully
- Support query parameters for filtering
- Return typed interfaces for notifications

### 2. Update NotificationsScreen
**File**: `aniseProject/src/screens/notifications/NotificationsScreen.tsx`

**Key Features to Add**:
- Real-time notification fetching
- Mark as read on tap
- Deep link navigation
- Delete functionality
- Pull to refresh
- Loading and empty states

**Notes**:
- Use React Navigation for deep linking
- Parse notification links to navigate to correct screens
- Update local state optimistically
- Handle navigation errors gracefully

---

## 🚀 Step-by-Step Implementation

### Step 1: Backend Setup
1. **Create notification service** with core functions
2. **Create notification controller** with API endpoints
3. **Add notification routes** to Express app
4. **Update app configuration** to mount routes
5. **Test API endpoints** with Postman/curl

### Step 2: Frontend Setup
1. **Create notification API service** for frontend calls
2. **Update NotificationsScreen** to use real data
3. **Test the integration** with backend
4. **Add error handling** and loading states

### Step 3: Integration with Existing Features
1. **Add notification triggers** to claim creation
2. **Add notification triggers** to proposal creation
3. **Add notification triggers** to voting events
4. **Test the complete flow** end-to-end

---

## 📝 Example: Claim Creation Notifications

### Implementation Steps
1. **Import NotificationService** in claimController.ts
2. **Get DAO data** after successful claim creation
3. **Send notification** to all DAO members
4. **Include relevant data**: claim title, amount, DAO name, link

### Notification Content
- **Type**: claim_created
- **Title**: "New Claim Created"
- **Message**: Include claim title and DAO name
- **Explanation**: Describe the claim amount and voting process
- **Link**: Deep link to the specific claim
- **Priority**: medium

### Testing Checklist
- [ ] Create a claim in a DAO
- [ ] Verify all DAO members receive notification
- [ ] Check notification contains correct data
- [ ] Test deep link navigation
- [ ] Verify read/unread states work

---

## 🧪 Testing the System

### 1. Test Notification Creation
- Create test events (claims, proposals)
- Verify notifications are sent to correct users
- Check notification content accuracy

### 2. Test Notification Retrieval
- Fetch notifications via API
- Verify pagination and filtering work
- Test unread/read filtering

### 3. Test User Interactions
- Mark notifications as read
- Delete notifications
- Test deep link navigation
- Verify pull-to-refresh functionality

### 4. Test Error Scenarios
- Network failures
- Invalid authentication
- Missing data
- Database errors

---

## 🔄 Adding More Notification Types

### Common Notification Types
1. **Proposal Creation**: Notify when new proposals are created
2. **Voting Started**: Alert members when voting begins
3. **Voting Ended**: Inform about voting results
4. **Member Joined**: Welcome new members
5. **Member Left**: Notify about departures
6. **Role Changes**: Alert about permission updates
7. **Payment Events**: Notify about financial transactions

### Implementation Pattern
1. **Choose notification type** and priority
2. **Create descriptive message** and explanation
3. **Generate appropriate deep link**
4. **Send to relevant users** (all members, specific roles, etc.)
5. **Test the notification flow**

### Priority Guidelines
- **High**: Voting events, urgent actions
- **Medium**: New content, member changes
- **Low**: General updates, reminders

---

## 🎯 Key Features Implemented

✅ **Real-time notifications** with Firestore  
✅ **Deep linking** to relevant screens  
✅ **Timestamps** and relative time display  
✅ **Detailed explanations** for context  
✅ **Priority levels** (low, medium, high)  
✅ **Read/unread states**  
✅ **Swipe to delete** functionality  
✅ **Pull to refresh**  
✅ **Empty states** and loading indicators  

---

## 📚 Additional Notes

### Performance Considerations
- Use Firestore indexes for efficient queries
- Implement pagination for large notification lists
- Consider notification cleanup for old items
- Use batch operations for multiple notifications

### Security Considerations
- Validate user permissions before sending notifications
- Sanitize notification content
- Implement rate limiting for notification creation
- Secure deep link validation

### Future Enhancements
- Push notifications (FCM/APNs)
- Notification preferences and settings
- Batch/digest notifications
- Notification templates
- Email notifications
- Notification analytics

---

## 📋 POST Endpoints That Should Trigger Notifications

Based on the complete backend endpoint list, here are the POST endpoints that should trigger notifications to relevant users:

### 🎯 **High Priority Notifications**

## **Notifications from the anise team.. updates etc...**

## **Admin Notifications when someone requests to join their DAO**
## **Eveyone in a group gets  notification when a claim is created + Voting starts**
## **Reminder to vote if a user hasnt**
## **Voting ends + Whether the payout has occured and how much the pot has decreased by**

## **Notifcations when proposal is created**
## **Admin notif when someone joins the group**
## **Announcement notif**

### ❌ **Endpoints That DON'T Need Notifications**

#### **Authentication (No notifications needed)**
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/reset-password`

#### **User Profile (No notifications needed)**
- `PUT /api/users/profile`

#### **DAO Creation (No notifications needed)**
- `POST /api/daos` - Creating a DAO doesn't need notifications since there are no existing members

#### **Payment Management (Internal system)**
- `POST /api/payment/create-mandate`
- `POST /api/payment/cancel-mandate`
- `POST /api/payment/webhook`

#### **Delete Operations (Optional notifications)**
- `DELETE /api/daos/:daoAddress/tasks/:taskId`
- `DELETE /api/daos/:daoAddress/events/:eventId`
- `DELETE /api/daos/:daoAddress/announcements/:announcementId`


### 🎯 **Implementation Priority**

1. **Phase 1**: High priority notifications (proposals, claims, voting)
2. **Phase 2**: Medium priority notifications (tasks, events, documents)
3. **Phase 3**: Optional notifications (updates, deletions)

This implementation provides a complete notification system that enhances user engagement and keeps members informed about important DAO activities! 