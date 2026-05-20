# AI Wingman Mode Guide

Complete guide to using AI Wingman mode for male users.

## Overview

AI Wingman is your personal dating coach designed specifically for male users. It helps you:
- Get strategic dating advice grounded in relationship expertise
- Maintain context across multiple conversation turns
- Navigate dating scenarios and challenges
- Build confidence and improve dating skills
- Use saved male profile context from prior interviews and `personality.md`

## Getting Started

### Accessing AI Wingman Mode

1. Start the application: `npm start`
2. Select "Male User (AI Wingman)" from main menu
3. Choose your activity:
   - Get Dating Advice
   - View Previous Sessions
   - Manage Custom Prompts

## Profile Library

Male profiles are stored in `male_profiles/`.

Each profile folder can include:

- `profile.json` for identity and archetype metadata
- `personality.md` for AI-readable personality context
- `interviews/` for saved interview notes
- `photos/` for optional profile visuals

The current library includes 21 male archetype profiles. See [Latest Features](Latest-Features) for the full profile-library overview.

## Get Dating Advice

### Purpose

Get strategic, actionable dating advice from an AI coach with expertise in relationships and dating dynamics.

### How It Works

1. **Ask Your Question**
   - Select or create your male profile first
   - Describe a dating scenario
   - Ask for specific advice
   - Share your concerns or challenges

2. **AI Wingman Provides Advice**
   - Strategic recommendations
   - Actionable steps
   - Reasoning behind advice
   - Real-world examples
   - Personalized context from `personality.md` when available

3. **Continue Conversation**
   - Ask follow-up questions
   - Explore different angles
   - Get deeper insights
   - Build on previous advice

4. **Save Session**
   - All advice is saved
   - Review anytime
   - Reference in future

### Example Advice Session

```
You: "I'm interested in someone at work, but I'm not sure
how to approach them without making it awkward."

AI Wingman: "Great question. Here's my strategic approach:

1. Build rapport first
   - Have casual conversations
   - Find common interests
   - Establish comfort level

2. Create a low-pressure opportunity
   - Suggest a group activity first
   - Then one-on-one coffee
   - Keep it casual and light

3. Be genuine and direct
   - Express interest clearly
   - Respect their response
   - Don't play games

Key tip: Workplace relationships require extra care.
Make sure you're both comfortable before escalating."

You: "What if they say no?"

AI Wingman: "Excellent question. Here's how to handle rejection:

1. Accept gracefully
   - Don't pressure them
   - Respect their decision
   - Maintain professionalism

2. Preserve the relationship
   - Keep interactions friendly
   - Don't make it awkward
   - Move forward positively

3. Learn and grow
   - Reflect on the experience
   - Don't take it personally
   - Apply lessons to future interactions"
```

### Advice Topics

AI Wingman can help with:
- **Approaching**: How to approach someone you're interested in
- **Conversation**: Starting and maintaining conversations
- **First Dates**: Planning and executing great first dates
- **Relationships**: Building and maintaining relationships
- **Challenges**: Navigating dating obstacles
- **Confidence**: Building dating confidence
- **Communication**: Expressing feelings and needs
- **Red Flags**: Identifying unhealthy patterns

### Session Tips

- **Be Specific**: Provide context for better advice
- **Ask Follow-ups**: Explore different angles
- **Take Notes**: Write down key points
- **Apply Advice**: Test recommendations in real situations
- **Reflect**: Think about what works for you
- **Keep Personality Notes Updated**: A richer `personality.md` gives Wingman better context

### Session Limits

- **Maximum 50 turns** per advice session
- **Auto-completion** when limit reached
- **Can pause and resume** anytime
- **All data saved** automatically

## View Previous Sessions

### Accessing Session History

1. Select "View Previous Sessions"
2. See all past advice sessions
3. Filter by:
   - Date range
   - Status (active/paused/completed)

### Session Information

Each session shows:
- **Date Created**: When session started
- **Turn Count**: Number of turns completed
- **Status**: Active, Paused, or Completed
- **Summary**: Key advice points

### Resuming Sessions

1. Select session to resume
2. Conversation continues from last turn
3. Turn count continues from previous session
4. All context is restored

### Reviewing Advice

After completing a session, you can:
- **Review Key Points**: Main advice given
- **Reflect**: Think about how to apply it
- **Reference**: Use in future situations
- **Track Progress**: See how advice helped

## Manage Custom Prompts

### Purpose

Create custom instructions to personalize AI Wingman's behavior.

### Creating Prompts

1. Select "Manage Custom Prompts"
2. Choose "Create New Prompt"
3. Enter:
   - **Name**: Unique identifier
   - **Content**: Your custom instruction

### Example Prompts

```
Name: "Confidence builder"
Content: "Focus on building my confidence and self-esteem.
Remind me of my strengths and positive qualities.
Help me overcome self-doubt."

Name: "Practical advice"
Content: "Give me specific, actionable steps I can take.
Include real-world examples and scenarios.
Focus on practical implementation."

Name: "Communication focus"
Content: "Help me improve my communication skills.
Focus on active listening, expressing feelings,
and understanding others' perspectives."

Name: "Red flag detector"
Content: "Help me identify potential red flags in dating.
Teach me to recognize unhealthy patterns.
Protect me from toxic relationships."
```

### Using Custom Prompts

- Prompts are applied to all future advice sessions
- Multiple prompts can be active simultaneously
- Prompts are combined with default behavior
- Can be edited or deleted anytime

### Prompt Tips

- **Be Specific**: Clear instructions work better
- **Be Concise**: Keep prompts focused
- **Test**: Try prompts and refine based on results
- **Combine**: Use multiple prompts for comprehensive advice

## Best Practices

### Before Asking for Advice

1. **Be Clear**: Know what you want to ask
2. **Provide Context**: Give relevant background
3. **Be Honest**: Share your real concerns
4. **Set Expectations**: Know what you're looking for

### During Advice Session

1. **Listen Carefully**: Consider the advice given
2. **Ask Follow-ups**: Explore different angles
3. **Take Notes**: Write down key points
4. **Reflect**: Think about how it applies to you

### After Advice Session

1. **Review**: Read through the advice again
2. **Plan**: Create action steps
3. **Apply**: Test recommendations in real situations
4. **Reflect**: Think about what worked

## Advanced Features

### Context Maintenance

AI Wingman maintains context across turns:
- Remembers previous advice
- Builds on earlier points
- Provides consistent guidance
- Learns from your responses

### Personalized Advice

Your custom prompts personalize advice:
- Tailored to your style
- Focused on your priorities
- Aligned with your values
- Specific to your challenges

### Advice Tracking

Track your progress:
- Review past advice
- See patterns in your questions
- Measure improvement
- Celebrate successes

## Common Scenarios

### Approaching Someone

```
You: "I see someone I'm interested in at the gym.
How do I approach them?"

AI Wingman: "Here's a strategic approach:
1. Make eye contact and smile
2. Start with a genuine compliment
3. Ask an open-ended question
4. Listen actively to their response
5. Suggest continuing conversation over coffee"
```

### First Date Planning

```
You: "I have a first date coming up. Any tips?"

AI Wingman: "Absolutely! Here's my advice:
1. Choose a comfortable venue
2. Plan something interactive
3. Be on time (early is better)
4. Ask questions and listen
5. Be genuine and authentic
6. Plan a second date if it goes well"
```

### Handling Rejection

```
You: "She said she's not interested. What now?"

AI Wingman: "Here's how to handle it:
1. Accept gracefully
2. Don't pressure or argue
3. Maintain dignity
4. Move forward positively
5. Learn from the experience
6. Don't take it personally"
```

## Troubleshooting

### "AI Wingman's advice doesn't apply to me"
- Create custom prompts for your situation
- Provide more context in your questions
- Ask follow-up questions to explore alternatives

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

1. **Be Honest**: Share your real concerns
2. **Be Specific**: Provide detailed context
3. **Ask Follow-ups**: Explore different angles
4. **Take Action**: Apply the advice
5. **Reflect**: Think about what works for you
6. **Iterate**: Refine your approach based on results

## Building Confidence

AI Wingman helps you build dating confidence:
- Provides strategic guidance
- Offers encouragement
- Helps you learn from experiences
- Celebrates your successes
- Supports your growth

## Next Steps

- [Custom Prompts Guide](Custom-Prompts) - Advanced customization
- [Session Management](Session-Management) - Manage your sessions
- [Troubleshooting](Troubleshooting) - Common issues
- [FAQ](FAQ) - Common questions

---

**Last Updated**: May 19, 2026
**Version**: 1.0.0
