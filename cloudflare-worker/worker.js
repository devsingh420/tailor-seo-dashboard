/**
 * Stitch Intelligence - Content Generator Worker
 * Uses Claude (Anthropic) API
 *
 * Environment Variable needed:
 * - ANTHROPIC_API_KEY: Your Anthropic API key
 */

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const { topic, category, platform } = await request.json();

      if (!topic || !platform) {
        return new Response(JSON.stringify({ error: 'Missing topic or platform' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const platformSpecs = {
        linkedin: {
          tone: 'professional, authoritative, thought-leadership',
          length: '200-250 words',
          style: 'Start with a compelling hook. Use line breaks for readability. Include 3-4 key insights with emoji bullets. End with a question or call-to-action to drive engagement.',
          hashtags: 5
        },
        instagram: {
          tone: 'aspirational, stylish, engaging with emojis throughout',
          length: '100-150 words',
          style: 'Punchy opening line that grabs attention. Short, impactful sentences. Lifestyle-focused and aspirational but relatable. Use emojis naturally.',
          hashtags: 20
        },
        facebook: {
          tone: 'conversational, engaging, shareable',
          length: '150-200 words',
          style: 'Personal, relatable angle. Ask questions to encourage comments. Make it shareable. Friendly but knowledgeable tone.',
          hashtags: 3
        },
        blog: {
          tone: 'informative, SEO-optimized, authoritative',
          length: '400-500 words',
          style: 'Use markdown formatting. Include a compelling H1 title, engaging intro, 2-3 H2 sections with insights, and a conclusion with call-to-action.',
          hashtags: 5
        }
      };

      const spec = platformSpecs[platform];

      const systemPrompt = `You are the content creator for "Stitch Intelligence" - a premium bespoke tailoring brand based in Bangkok, Thailand.

Your expertise covers the complete gentleman's lifestyle:
- Bespoke suits and tailoring craftsmanship
- Luxury timepieces (Rolex, Patek Philippe, Audemars Piguet, Omega)
- Designer footwear and leather goods
- Accessories (silk ties, cufflinks, pocket squares)
- Luxury automobiles (Porsche, Mercedes, BMW, Bentley)
- Premium gadgets and technology

Brand voice: Sophisticated, knowledgeable, aspirational yet approachable. You educate while inspiring. Never salesy - always valuable content first.

Target audience: Business professionals, executives, entrepreneurs, and style-conscious men aged 30-55 who appreciate quality craftsmanship and the finer things in life.`;

      const userPrompt = `Create a ${platform.toUpperCase()} post about this trending topic:

"${topic}"

Category: ${category || 'Luxury Lifestyle'}

Requirements:
- Tone: ${spec.tone}
- Length: ${spec.length}
- Style: ${spec.style}
- Include exactly ${spec.hashtags} relevant hashtags at the end
- Make it timely, insightful, and engaging
- Subtly connect to men's style and craftsmanship when natural
- Be specific with details - avoid generic statements

Return ONLY the post content followed by hashtags on a new line. No labels, explanations, or meta-commentary.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: `${systemPrompt}\n\n${userPrompt}`
            }
          ]
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Claude API Error:', error);
        return new Response(JSON.stringify({ error: 'AI generation failed', details: error }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const data = await response.json();
      const content = data.content[0].text;

      // Parse content and hashtags
      const hashtagMatch = content.match(/#[\w]+/g) || [];
      const text = content.replace(/#[\w]+/g, '').trim();

      return new Response(JSON.stringify({
        text,
        hashtags: hashtagMatch.join(' '),
        platform,
        topic
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};
