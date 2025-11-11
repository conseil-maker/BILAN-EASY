/**
 * Claude (Anthropic) Provider
 * 
 * Implementation of AIProviderInterface for Anthropic Claude API
 */

import Anthropic from '@anthropic-ai/sdk';
import { Answer, Package, Question, QuestionType, Summary, UserProfile, DashboardData, CoachingStyle } from '../../types';
import { QUESTION_CATEGORIES } from "../../constants";
import type { AIProviderInterface, GenerateQuestionOptions } from '../aiService';

export class ClaudeProvider implements AIProviderInterface {
  name: 'claude' = 'claude';
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-5-sonnet-20241022') {
    if (!apiKey || apiKey === 'undefined' || apiKey === '') {
      throw new Error('CLAUDE_API_KEY is required');
    }
    // Allow browser usage for frontend (API keys are already exposed in Vite build)
    this.client = new Anthropic({ 
      apiKey,
      dangerouslyAllowBrowser: true 
    });
    this.model = model;
  }

  private getSystemInstruction(style: CoachingStyle): string {
    switch (style) {
      case 'analytic':
        return "You are an analytical and structured career coach. Your approach is methodical and data-driven. You ask precise questions to deconstruct problems logically. Language: French. Always respond with valid JSON only, no markdown formatting.";
      case 'creative':
        return "You are a creative and inspiring career coach. Your approach is to open new perspectives and encourage out-of-the-box thinking. You use metaphors and ask stimulating questions. Language: French. Always respond with valid JSON only, no markdown formatting.";
      case 'collaborative':
      default:
        return "You are a collaborative and encouraging career coach. Your tone is warm, supportive, and empathetic. You focus on the user's strengths and build their confidence. Language: French. Always respond with valid JSON only, no markdown formatting.";
    }
  }

  private parseJsonResponse<T>(jsonString: string, functionName: string): T {
    try {
      // Remove markdown code blocks if present
      const cleaned = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned) as T;
    } catch (error) {
      console.error(`Error parsing JSON from ${functionName}:`, error);
      console.error("Received text:", jsonString);
      throw new Error(`Failed to parse JSON response in ${functionName}.`);
    }
  }

  private async callClaude(prompt: string, systemInstruction: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: systemInstruction,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Claude API returned non-text response');
    }
    return content.text;
  }

  async generateQuestion(
    phaseKey: 'phase1' | 'phase2' | 'phase3',
    categoryIndex: number,
    previousAnswers: Answer[],
    userName: string,
    coachingStyle: CoachingStyle,
    userProfile: UserProfile | null = null,
    options: GenerateQuestionOptions = {}
  ): Promise<Question> {
    const systemInstruction = this.getSystemInstruction(coachingStyle);
    
    // Enhanced history: Include question titles to prevent duplicates
    const history = previousAnswers.map(a => {
      const questionTitle = (a as any).questionTitle || a.questionId;
      return `Question: ${questionTitle}\nAnswer: ${a.value}`;
    }).join('\n\n');
    
    // Extract previous question titles to prevent repetition
    const previousQuestionTitles = previousAnswers
      .map(a => (a as any).questionTitle || '')
      .filter(title => title.length > 0);
    
    // Context-aware instruction based on answer length
    const lastAnswer = previousAnswers[previousAnswers.length - 1];
    let contextAwareInstruction = "";
    if (lastAnswer) {
      const answerLength = lastAnswer.value.length;
      if (answerLength < 50) {
        contextAwareInstruction = "IMPORTANT: The user's last answer was very short. Ask a more specific, deeper question to help them elaborate. Use open-ended questions that encourage detailed responses.";
      } else if (answerLength > 300) {
        contextAwareInstruction = "IMPORTANT: The user's last answer was very detailed. Acknowledge their thoroughness and ask a follow-up question that builds on their insights or explores a related but different aspect.";
      }
    }

    let taskDescription = "";
    if (options.isModuleQuestion) {
      taskDescription = `This is question ${options.isModuleQuestion.questionNum}/3 for the optional module on '${options.isModuleQuestion.moduleId}'. Ask a focused question on this topic.`;
    } else {
      const phaseInfo = QUESTION_CATEGORIES[phaseKey];
      const category = phaseInfo.categories[categoryIndex];
      taskDescription = `This is the main assessment. Phase: ${phaseInfo.name}, Current Category: ${category}. Generate the next question.`;
    }

    let profileContext = "";
    if (userProfile && previousAnswers.length === 0) {
      profileContext = `We have some initial information from the user's profile: Role: ${userProfile.currentRole}, Key Skills: ${userProfile.keySkills.join(', ')}, Past Experiences: ${userProfile.pastExperiences.join(', ')}. Use this to ask a personalized FIRST question.`;
    }

    let specialInstruction = "";
    if (options.useJoker) {
      specialInstruction = "CRITICAL INSTRUCTION: The user is stuck on the previous question. Your task is to reformulate it from a completely different angle or ask a much simpler, related question to help them unlock their thoughts. Acknowledge their request for help subtly.";
    }
    
    // Difficulty progression: Earlier questions are easier, later ones are deeper
    const questionNumber = previousAnswers.length + 1;
    const difficultyInstruction = questionNumber <= 5 
      ? "This is an early question. Keep it simple and welcoming to help the user feel comfortable."
      : questionNumber <= 15
      ? "This is a mid-assessment question. You can go deeper and explore more specific aspects."
      : "This is a later question. Ask deeper, more reflective questions that help synthesize insights.";
    
    const duplicatePrevention = previousQuestionTitles.length > 0
      ? `CRITICAL: Do NOT repeat or ask similar questions to these previous questions: ${previousQuestionTitles.slice(-5).join(', ')}. Ensure your question is unique and explores a different angle.`
      : "";

    const prompt = `Context: User Name: ${userName}. ${profileContext} 

Previous Q&A History:
${history || "None."}

${duplicatePrevention}

${contextAwareInstruction}

${difficultyInstruction}

${specialInstruction}

Task: ${taskDescription}

Generate a question in French as a JSON object with this exact structure:
{
  "id": "unique-id-here",
  "title": "Question text in French",
  "description": "Optional additional context",
  "type": "PARAGRAPH" or "MULTIPLE_CHOICE",
  "theme": "Theme name",
  "choices": ["option1", "option2"] (only if type is MULTIPLE_CHOICE),
  "required": true
}`;

    const response = await this.callClaude(prompt, systemInstruction);
    const questionData = this.parseJsonResponse<any>(response, 'generateQuestion');
    const type = questionData.type?.toUpperCase() === 'MULTIPLE_CHOICE' ? QuestionType.MULTIPLE_CHOICE : QuestionType.PARAGRAPH;
    return { ...questionData, type, choices: type === QuestionType.MULTIPLE_CHOICE ? questionData.choices : undefined } as Question;
  }

  async generateSynthesis(
    lastAnswers: Answer[],
    userName: string,
    coachingStyle: CoachingStyle
  ): Promise<{ synthesis: string; confirmationRequest: string }> {
    const systemInstruction = this.getSystemInstruction(coachingStyle);
    
    // Enhanced history: Include question titles for better context
    const history = lastAnswers.map(a => {
      const questionTitle = (a as any).questionTitle || a.questionId;
      return `Question: ${questionTitle}\nAnswer: ${a.value}`;
    }).join('\n\n');
    
    // Include specific examples from answers in synthesis
    const answerExamples = lastAnswers
      .map(a => a.value.length > 20 ? a.value.substring(0, 100) + '...' : a.value)
      .join(' | ');
    
    const prompt = `Context: User Name: ${userName}. 

Task: Act as an attentive coach. Based on the user's last few answers, create a concise, personalized summary that includes specific examples from their responses. Then formulate a polite question to confirm if your summary is correct.

IMPORTANT: 
- Include at least one specific detail or example from the user's answers in your synthesis
- Make the synthesis feel personal and relevant to what they actually said
- Keep it concise (1-2 sentences maximum)
- The confirmation question should be warm and inviting

Last answers with context:
${history}

Key points to highlight: ${answerExamples}

Respond as JSON:
{
  "synthesis": "One sentence summary in French with specific examples",
  "confirmationRequest": "Polite confirmation question in French"
}`;

    const response = await this.callClaude(prompt, systemInstruction);
    return this.parseJsonResponse<{ synthesis: string; confirmationRequest: string }>(response, 'generateSynthesis');
  }

  async generateSummary(
    answers: Answer[],
    pkg: Package,
    userName: string,
    coachingStyle: CoachingStyle
  ): Promise<Summary> {
    const systemInstruction = this.getSystemInstruction(coachingStyle);
    
    // Enhanced transcript: Include question titles for better context
    const fullTranscript = answers.map(a => {
      const questionTitle = (a as any).questionTitle || a.questionId;
      return `Question: ${questionTitle}\nAnswer: ${a.value}`;
    }).join('\n\n');

    const maxTranscriptLength = 10000;
    const truncatedTranscript = fullTranscript.length > maxTranscriptLength
      ? fullTranscript.substring(0, maxTranscriptLength) + '\n\n[... transcript tronqué ...]'
      : fullTranscript;

    const prompt = `Context: User Name: ${userName}, Package: ${pkg.name}. 

Transcript of the complete assessment:
${truncatedTranscript}

Task: Analyze the transcript and generate a comprehensive, personalized summary in French as JSON.

CRITICAL REQUIREMENTS:
1. **Personalization**: Use the user's actual name (${userName}) and reference specific details from their answers
2. **Key Strengths & Areas for Development**: Each point MUST include a 'sources' array with 1-3 direct quotes from the user's answers that justify this point. Quotes should be verbatim from the transcript.
3. **Action Plan**: Each item must have a unique 'id' and 'text'. Make the action items specific and actionable, based on what the user actually said.
4. **Profile Type**: Create a descriptive, personalized title that reflects their unique professional profile
5. **Priority Themes**: Identify 3-5 themes that truly emerged from their answers, not generic themes
6. **Recommendations**: Provide 3-4 specific recommendations tailored to their situation, referencing their answers

The summary should feel like it was written specifically for ${userName}, not a generic template.

JSON structure:
{
  "profileType": "Professional profile title in French",
  "priorityThemes": ["theme1", "theme2", ...],
  "maturityLevel": "Description of clarity level in French",
  "keyStrengths": [{"text": "strength", "sources": ["quote1", "quote2"]}, ...],
  "areasForDevelopment": [{"text": "area", "sources": ["quote1", "quote2"]}, ...],
  "recommendations": ["rec1", "rec2", ...],
  "actionPlan": {
    "shortTerm": [{"id": "id1", "text": "action1"}, ...],
    "mediumTerm": [{"id": "id2", "text": "action2"}, ...]
  }
}

Each keyStrengths and areasForDevelopment point MUST include a 'sources' array with 1-3 direct quotes.`;

    const response = await this.callClaude(prompt, systemInstruction);
    const summaryData = this.parseJsonResponse<any>(response, 'generateSummary');
    const processActionPlan = (items: any[]): any[] => items.map(item => ({ ...item, completed: false }));

    if (summaryData.actionPlan && summaryData.actionPlan.shortTerm && summaryData.actionPlan.mediumTerm) {
      return {
        ...summaryData,
        actionPlan: {
          shortTerm: processActionPlan(summaryData.actionPlan.shortTerm),
          mediumTerm: processActionPlan(summaryData.actionPlan.mediumTerm)
        }
      };
    }

    return { ...summaryData, actionPlan: { shortTerm: [], mediumTerm: [] } };
  }

  async analyzeThemesAndSkills(answers: Answer[]): Promise<DashboardData> {
    const history = answers.map(a => `Q: ${a.questionId}\nA: ${a.value}`).join('\n\n');
    const prompt = `Analyze the following answers from a skills assessment. Identify the main themes and assess 5 core skills.

Respond as JSON:
{
  "themes": [{"text": "theme1", "weight": 8}, ...],
  "skills": [
    {"label": "Communication", "score": 4},
    {"label": "Leadership", "score": 3},
    {"label": "Analyse", "score": 5},
    {"label": "Adaptabilité", "score": 4},
    {"label": "Collaboration", "score": 4}
  ]
}

Answers: ${history}`;

    const response = await this.callClaude(prompt, this.getSystemInstruction('collaborative'));
    return this.parseJsonResponse<DashboardData>(response, 'analyzeThemesAndSkills');
  }

  async analyzeUserProfile(cvText: string): Promise<UserProfile> {
    const prompt = `Analyze the following professional profile text (likely from a CV) and extract key information.

Respond as JSON:
{
  "fullName": "Name if available",
  "currentRole": "Current job title",
  "keySkills": ["skill1", "skill2", ...],
  "pastExperiences": ["exp1", "exp2", ...]
}

Text to analyze: ${cvText}`;

    const response = await this.callClaude(prompt, this.getSystemInstruction('collaborative'));
    return this.parseJsonResponse<UserProfile>(response, 'analyzeUserProfile');
  }

  async suggestOptionalModule(answers: Answer[]): Promise<{ isNeeded: boolean; moduleId?: string; reason?: string }> {
    const history = answers.map(a => `Q: ${a.questionId}\nA: ${a.value}`).join('\n\n');
    const prompt = `Analyze the user's answers. Determine if they exhibit a strong need for a specific, short optional module on one of these topics: 'transition-management' (fear of change, uncertainty), 'self-confidence' (self-doubt, impostor syndrome), or 'work-life-balance' (stress, burnout, desire for better balance). Only set isNeeded to true if the signal is clear and strong.

Respond as JSON:
{
  "isNeeded": true/false,
  "moduleId": "transition-management" | "self-confidence" | "work-life-balance" (only if isNeeded is true),
  "reason": "Short explanation in French" (only if isNeeded is true)
}

Answers: ${history}`;

    const response = await this.callClaude(prompt, this.getSystemInstruction('collaborative'));
    return this.parseJsonResponse<any>(response, 'suggestOptionalModule');
  }

  async findResourceLeads(actionItemText: string): Promise<{ searchKeywords: string[]; resourceTypes: string[]; platformExamples: string[] }> {
    const prompt = `Context: A user has the following action item in their career plan: "${actionItemText}". Task: Your role is to be a helpful guide, not to do the work for them. To empower their research, provide a list of research leads.

Respond as JSON in French:
{
  "searchKeywords": ["keyword1", "keyword2", ...],
  "resourceTypes": ["type1", "type2", ...],
  "platformExamples": ["platform1", "platform2", ...]
}`;

    const response = await this.callClaude(prompt, this.getSystemInstruction('collaborative'));
    return this.parseJsonResponse<any>(response, 'findResourceLeads');
  }
}

