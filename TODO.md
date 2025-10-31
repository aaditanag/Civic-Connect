# TODO: Implement Proper Database for Reports

## Backend Changes
- [x] Update Issue model to reference user ID instead of string
- [x] Modify backend routes to associate issues with authenticated users
- [x] Add user-specific issue fetching endpoints

## Frontend Changes
- [x] Update issueService to include user ID in issue creation
- [x] Add user-specific methods to issueService
- [x] Replace dummy data in Profile page with real API calls
- [x] Update CitizenView to show real statistics and recent issues
- [x] Update ReportIssue to include user ID in issue creation (handled by backend authentication)

## Testing
- [ ] Test user authentication and issue creation
- [ ] Verify reports appear in user's profile
- [ ] Check statistics update correctly
