export const getRedditComments = async (accessToken) => {
  try {
    const response = await fetch('https://oauth.reddit.com/user/me/comments', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Check if the response status is OK (200)
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to fetch comments: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();

    // Ensure the data structure is as expected
    if (!data?.data?.children) {
      throw new Error('Unexpected data format from Reddit API');
    }

    return data.data.children.map((child) => child.data);
  } catch (error) {
    console.error('Error fetching Reddit comments:', error);
    throw error; // Re-throw the error for the caller to handle
  }
};

export const analyzeComment = async (text) => {
  try {
    const response = await fetch('http://localhost:8000/predict/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    // Check if the response status is OK (200)
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to analyze comment: ${errorData.message || response.statusText}`);
    }

    const result = await response.json();

    // Ensure the result contains the expected fields
    if (!result || typeof result.hate_speech === 'undefined') {
      throw new Error('Unexpected response format from analysis API');
    }

    return result;
  } catch (error) {
    console.error('Error analyzing comment:', error);
    throw error; // Re-throw the error for the caller to handle
  }
};