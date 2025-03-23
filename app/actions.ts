"use server"

import { generateText, streamText } from "ai"
import { openaiClient } from "@/lib/openai"
import { z } from "zod"
import { logToFile } from "@/utils/logger"

// AI Tutor function
export async function askTutor(question: string): Promise<string> {
  try {
    const { text } = await generateText({
      model: openaiClient("gpt-4o"),
      system:
        "You are a helpful, knowledgeable tutor. Provide clear, concise, and accurate information. Include examples where appropriate. Be encouraging and supportive.",
      prompt: question,
    })

    return text
  } catch (error) {
    console.error("Error in askTutor:", error)
    return "Sorry, I encountered an error while processing your question. Please try again."
  }
}

// Streaming AI Tutor function
export async function streamTutorResponse(question: string) {
  try {
    const result = streamText({
      model: openaiClient("gpt-4o"),
      system:
        "You are a helpful, knowledgeable tutor. Provide clear, concise, and accurate information. Include examples where appropriate. Be encouraging and supportive.",
      prompt: question,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in streamTutorResponse:", error)
    throw new Error("Failed to stream response")
  }
}

// Course Generator function
export async function generateCourse(topic: string, level: string, additionalInfo: string) {
  try {
    const courseSchema = z.object({
      title: z.string(),
      description: z.string(),
      sections: z.array(
        z.object({
          title: z.string(),
          subsections: z.array(
            z.object({
              title: z.string(),
              content: z.string(),
            }),
          ),
        }),
      ),
    })

    const prompt = `
      Create a comprehensive online course about "${topic}" for ${level} level students.
      ${additionalInfo ? `Additional requirements: ${additionalInfo}` : ""}
      
      The course should include:
      1. A catchy title
      2. A detailed description
      3. 5-7 main sections
      4. Each section should have 2-3 subsections
      
      Make the content educational, engaging, and practical.
      Return the response in the following JSON format:
      {
        "title": "Course Title",
        "description": "Course Description",
        "sections": [
          {
            "title": "Section Title",
            "subsections": [
              {
                "title": "Subsection Title",
                "content": "Subsection Content"
              }
            ]
          }
        ]
      }
    `

    const data = await generateText({
      model: openaiClient("gpt-4o"),
      system:
        "You are an expert course creator with experience in instructional design. Create well-structured, engaging, and educational course content. Return ONLY valid JSON that matches the schema.",
      prompt,
    })

    const text = data.text.replace(/```json|```/g, "").trim();
    
    // Log the raw response for debugging
    logToFile('generateCourseResponse.log', text);

    // Parse the JSON response
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON parsing error in generateCourse:", parseError);
      throw new Error("Failed to parse course content");
    }
    return courseSchema.parse(jsonResponse)
  } catch (error) {
    console.error("Error in generateCourse:", error)
    throw new Error("Failed to generate course content")
  }
}

