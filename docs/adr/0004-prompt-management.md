# 4. Prompt Management Strategy

## Status
Accepted

## Context
Need to allow admin customization of AI prompts while:
- Maintaining security (no backend storage)
- Providing clear user feedback
- Preserving default behavior
- Supporting temporary persistence

## Decision
- Store custom prompts in localStorage
- Admin interface at protected route /admin/prompt
- Fallback to public/prompt.txt when no custom prompt exists
- Toast notifications for save confirmation
- Console logging for debugging
- Reset button to clear custom prompt

## Consequences
✅ No backend required for prompt management  
✅ Clear visual feedback for users
✅ Maintains default behavior when no custom prompt
✅ Temporary persistence across page refreshes
❌ localStorage clears on browser data wipe
❌ No version history of prompt changes
❌ Limited to browser instance
