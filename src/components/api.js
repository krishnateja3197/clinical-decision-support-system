
export const analyzeText = async (text) => {
    try {
      const response = await fetch('http://localhost:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
  
      if (!response.ok) {
        throw new Error('Error: ' + response.statusText);
      }
  
      const result = await response.json();
      return result; // This will be used in your frontend to display the diagnosis
    } catch (error) {
      return { error: error.message }; // In case of an error, return the error message
    }
  };
  

