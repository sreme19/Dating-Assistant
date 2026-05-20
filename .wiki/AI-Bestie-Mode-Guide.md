# AI Bestie Mode Guide

Complete guide to using AI Bestie mode for female users.

## Overview

AI Bestie is your personal dating coach designed specifically for female users. It helps you:
- Interview potential matches with structured questions
- Build a personalized preferences knowledge base
- Track interview history and insights
- Identify red flags and compatibility issues
- Use saved archetype profiles, preference files, interview transcripts, and profile photos

## Getting Started

### Accessing AI Bestie Mode

1. Start the application: `npm start`
2. Select "Female User (AI Bestie)" from main menu
3. Choose your activity:
   - Interview a Match
   - Gather My Preferences
   - View Previous Sessions
   - Manage Custom Prompts

## Profile Library

Female profiles are stored in `female_profiles/`.

Each profile folder can include:

- `profile.json` for identity and archetype metadata
- `preferences.md` for dating preferences and screening logic
- `interviews/` for saved match interview transcripts
- `photos/` for optional profile visuals

The current library includes 22 female archetype profiles. See [Latest Features](Latest-Features) for the full profile-library overview.

## Interview a Match

### Purpose

Interview mode helps you evaluate a potential match through structured questions based on your preferences.

### How It Works

1. **Choose Profile Context**
   - Select the female profile whose preferences should guide the interview
   - Review or use the saved `preferences.md` context

2. **Select or Enter Match Information**
   - Choose an existing male profile when available
   - Or enter new match details:
   - Name
   - Age
   - Occupation
   - Interests (comma-separated)
   - Any other relevant details

3. **AI Bestie Generates Questions**
   - Initial questions based on match profile
   - Questions tailored to your preferences
   - Follow-up questions based on responses

4. **Provide Match Responses**
   - Enter what the match said
   - Be as detailed as possible
   - Include direct quotes when relevant

5. **Get Analysis**
   - AI Bestie analyzes responses
   - Identifies red flags
   - Highlights compatibility points
   - Provides insights

6. **Save Outputs**
   - Interview transcripts can be saved under the relevant female profile
   - Male profile and personality summaries can be created or updated

### Example Interview

```
Match Profile:
- Name: Alex
- Age: 30
- Occupation: Marketing Manager
- Interests: Travel, Cooking, Fitness

AI Bestie: "Based on Alex's profile and your preferences,
I'd like to ask: What does a typical week look like for you?"

You: "I work long hours, usually 50-60 hours a week.
I try to hit the gym 3-4 times a week and cook on weekends."

AI Bestie: "That's helpful context. How do you balance
work stress with personal relationships?"

You: "I try to be present when I'm with someone,
but work can be demanding."

AI Bestie: "I see a potential concern here. You mentioned
working 50-60 hours weekly. How would you prioritize
a new relationship alongside that schedule?"
```

### Interview Tips

- **Be Specific**: Provide detailed responses for better analysis
- **Ask Clarifying Questions**: If you need more info, ask
- **Trust Your Gut**: AI Bestie provides analysis, but your intuition matters
- **Take Notes**: Write down key points for later reference
- **Review Red Flags**: Pay attention to identified concerns
- **Keep Context Fresh**: Update `preferences.md` when your standards or deal-breakers change

## Answering Match Questions

AI Bestie can also help prepare answers when a match asks the woman a question. It uses the saved female preference profile so responses stay aligned with her values, boundaries, and dating goals.

Use this for:

- preparing concise responses before or after a date
- checking whether a match's question style feels compatible
- avoiding generic answers that do not reflect the saved profile

### Session Limits

- **Maximum 50 turns** per interview session
- **Auto-completion** when limit reached
- **Can pause and resume** anytime
- **All data saved** automatically

## Gather My Preferences

### Purpose

Build a personalized preferences knowledge base that AI Bestie uses to evaluate matches.

### How It Works

1. **Answer Initial Questions**
   - What are your dating goals?
   - What qualities matter most?
   - What are your deal-breakers?

2. **Progressive Questioning**
   - AI Bestie asks follow-up questions
   - Digs deeper into your preferences
   - Identifies patterns and themes

3. **Preference Synthesis**
   - Your answers are synthesized into a KB
   - Stored for future interviews in `female_profiles/<profile>/preferences.md`
   - Updated as preferences evolve

### Example Preference Session

```
AI Bestie: "Let's build your preferences profile.
What are your top 3 qualities in a partner?"

You: "Ambition, kindness, and humor"

AI Bestie: "Great! Tell me more about 'ambition'.
What does that look like to you?"

You: "Someone who has goals and works toward them,
but not at the expense of relationships."

AI Bestie: "That's important context. How do you feel
about someone who prioritizes family over career?"

You: "That's actually really important to me too."

AI Bestie: "So both ambition AND family values matter.
What about financial stability?"
```

### Preference Tips

- **Be Honest**: Your true preferences matter
- **Be Specific**: Vague preferences lead to vague analysis
- **Evolve**: Your preferences can change over time
- **Review**: Periodically review and update your KB
- **Use in Interviews**: Your KB is used to evaluate matches

## View Previous Sessions

### Accessing Session History

1. Select "View Previous Sessions"
2. See all past interviews and preference sessions
3. Filter by:
   - Mode (interview/preference)
   - Date range
   - Status (active/paused/completed)

### Session Information

Each session shows:
- **Date Created**: When session started
- **Mode**: Interview or Preference Gathering
- **Turn Count**: Number of turns completed
- **Status**: Active, Paused, or Completed
- **Summary**: Key points from session

### Resuming Sessions

1. Select session to resume
2. Conversation continues from last turn
3. Turn count continues from previous session
4. All context is restored

### Session Summary

After completing a session, you can view:
- **Key Insights**: Main takeaways
- **Red Flags**: Identified concerns
- **Compatibility**: Match compatibility assessment
- **Next Steps**: Recommendations

## Manage Custom Prompts

### Purpose

Create custom instructions to personalize AI Bestie's behavior.

### Creating Prompts

1. Select "Manage Custom Prompts"
2. Choose "Create New Prompt"
3. Enter:
   - **Name**: Unique identifier
   - **Content**: Your custom instruction

### Example Prompts

```
Name: "Focus on red flags"
Content: "Pay special attention to any red flags
in the match's responses. Highlight potential concerns
about commitment, honesty, or compatibility."

Name: "Career focus"
Content: "Evaluate the match's career ambitions
and how they balance work with relationships.
Ask about career goals and priorities."

Name: "Family values"
Content: "Explore the match's views on family,
children, and long-term commitment.
Ask about their family background and values."
```

### Using Custom Prompts

- Prompts are applied to all future interviews
- Multiple prompts can be active simultaneously
- Prompts are combined with default behavior
- Can be edited or deleted anytime

### Prompt Tips

- **Be Specific**: Clear instructions work better
- **Be Concise**: Keep prompts focused
- **Test**: Try prompts and refine based on results
- **Combine**: Use multiple prompts for comprehensive analysis

## Best Practices

### Before an Interview

1. **Update Preferences**: Ensure your KB is current
2. **Create Relevant Prompts**: Add custom prompts for focus areas
3. **Prepare Questions**: Think about what you want to know
4. **Set Expectations**: Know what you're looking for

### During an Interview

1. **Be Detailed**: Provide specific responses
2. **Ask Follow-ups**: Request clarification when needed
3. **Take Notes**: Write down important points
4. **Trust Analysis**: Consider AI Bestie's insights

### After an Interview

1. **Review Summary**: Read key insights
2. **Note Red Flags**: Pay attention to concerns
3. **Trust Your Gut**: Combine AI analysis with intuition
4. **Update Preferences**: Refine based on learnings

## Advanced Features

### Preference Evolution

Your preferences can change over time:
1. Periodically review your KB
2. Update based on new insights
3. Gather preferences again if major changes
4. Use updated KB in future interviews

### Red Flag Identification

AI Bestie identifies potential red flags:
- Inconsistencies in responses
- Misalignment with your values
- Potential commitment issues
- Communication concerns

### Compatibility Assessment

After interviews, AI Bestie provides:
- Overall compatibility score
- Specific compatibility areas
- Potential challenges
- Recommendations

## Troubleshooting

### "AI Bestie not asking relevant questions"
- Update your preferences KB
- Create custom prompts for focus areas
- Provide more detailed match information

### "Session keeps timing out"
- Check internet connection
- Verify API key is valid
- Try again (automatic retry included)

### "Can't resume session"
- Ensure session is paused (not completed)
- Check database is accessible
- Try restarting application

### "Custom prompts not working"
- Verify prompt content is clear
- Check prompt is enabled
- Try creating new prompt

## Tips for Success

1. **Build Strong Preferences**: Invest time in your KB
2. **Be Specific**: Detailed information leads to better analysis
3. **Trust the Process**: AI Bestie learns from your feedback
4. **Review Regularly**: Check insights and red flags
5. **Combine with Intuition**: Use AI analysis + your gut feeling

## Next Steps

- [Custom Prompts Guide](Custom-Prompts) - Advanced customization
- [Session Management](Session-Management) - Manage your sessions
- [Troubleshooting](Troubleshooting) - Common issues
- [FAQ](FAQ) - Common questions

---

**Last Updated**: May 19, 2026
**Version**: 1.0.0
