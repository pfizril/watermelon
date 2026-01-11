import openai
import tiktoken

# Set your OpenAI API key
openai.api_key = "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"

def count_tokens(text, model="gpt-3.5-turbo"):
    """Count the number of tokens in a text string."""
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

def test_chatbot(prompt, model="gpt-3.5-turbo"):
    """Send a prompt to OpenAI and return response with token counts."""
    
    # Count input tokens
    input_tokens = count_tokens(prompt, model)
    print(f"Input tokens: {input_tokens}")
    
    try:
        # Make API call
        response = openai.chat.completions.create(
            model=model,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        
        # Extract response
        message = response.choices[0].message.content
        
        # Get token usage from response
        total_tokens = response.usage.total_tokens
        prompt_tokens = response.usage.prompt_tokens
        completion_tokens = response.usage.completion_tokens
        
        # Display results
        print(f"\nPrompt: {prompt}")
        print(f"\nResponse: {message}")
        print(f"\n--- Token Usage ---")
        print(f"Prompt tokens: {prompt_tokens}")
        print(f"Completion tokens: {completion_tokens}")
        print(f"Total tokens: {total_tokens}")
        
        return message, total_tokens
        
    except Exception as e:
        print(f"Error: {e}")
        return None, 0

if __name__ == "__main__":
    # Test with a simple prompt
    test_prompt = "What is the capital of France?"
    test_chatbot(test_prompt)
    
    # Test with a longer prompt
    print("\n" + "="*50 + "\n")
    longer_prompt = "Explain the concept of machine learning in simple terms."
    test_chatbot(longer_prompt)