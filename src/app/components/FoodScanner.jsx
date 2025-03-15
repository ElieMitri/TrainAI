import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { ClarifaiStub, grpc } from 'clarifai';

const FoodScanner = () => {
  const [foodName, setFoodName] = useState('');
  const [nutritionData, setNutritionData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Clarifai API setup
  const clarifaiStub = ClarifaiStub.grpc();
  const metadata = new grpc.Metadata();
  metadata.set('Authorization', `Key YOUR_CLARIFAI_API_KEY`);

  const { getRootProps, getInputProps } = useDropzone({
    accept: 'image/*',
    onDrop: (acceptedFiles) => handleImageUpload(acceptedFiles[0]),
  });

  // Handle image upload and recognition
  const handleImageUpload = async (file) => {
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Send the image to Clarifai for recognition
      const clarifaiResponse = await axios.post(
        'https://api.clarifai.com/v2/models/food-recognition-v1/outputs',
        formData,
        {
          headers: {
            'Authorization': `Key YOUR_CLARIFAI_API_KEY`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const foodDetected = clarifaiResponse.data.outputs[0].data.concepts[0].name;
      setFoodName(foodDetected);
      fetchNutritionData(foodDetected); // Fetch nutritional data for the detected food
    } catch (err) {
      setError('Failed to recognize the food. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch nutritional data from Edamam API
  const fetchNutritionData = async (food) => {
    try {
      const edamamResponse = await axios.get(
        `https://api.edamam.com/api/food-database/v2/parser`,
        {
          params: {
            ingr: food,
            app_id: 'YOUR_EDAMAM_APP_ID',
            app_key: 'YOUR_EDAMAM_APP_KEY',
          },
        }
      );

      setNutritionData(edamamResponse.data);
    } catch (err) {
      setError('Failed to fetch nutrition data.');
    }
  };

  return (
    <div className="food-scanner">
      <h2>Scan Food</h2>
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>Drag & drop an image of food, or click to select one</p>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {foodName && <h3>Food detected: {foodName}</h3>}

      {nutritionData && (
        <div className="nutrition-info">
          <h4>Nutrition Facts</h4>
          <ul>
            {nutritionData.parsed[0].food.nutrients && (
              <li>Calories: {nutritionData.parsed[0].food.nutrients.ENERC_KCAL} kcal</li>
            )}
            {nutritionData.parsed[0].food.nutrients && (
              <li>Protein: {nutritionData.parsed[0].food.nutrients.PROCNT} g</li>
            )}
            {nutritionData.parsed[0].food.nutrients && (
              <li>Fat: {nutritionData.parsed[0].food.nutrients.FAT} g</li>
            )}
            {nutritionData.parsed[0].food.nutrients && (
              <li>Carbs: {nutritionData.parsed[0].food.nutrients.CHOCDF} g</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FoodScanner;
