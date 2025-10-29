import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import jqueryAPI from '../../services/jqueryAPI';
import { useAuth } from '../../context/AuthContext';
import Loading from '../Common/Loading';
import './Recipes.css';

const RecipeDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const response = await jqueryAPI.recipe.getRecipeById(id);
      setRecipe(response);
    } catch (error) {
      console.error('Error fetching recipe:', error);
    }
    setLoading(false);
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Please login to like recipes');
      return;
    }
    try {
      await jqueryAPI.recipe.toggleLike(id);
      fetchRecipe();
    } catch (error) {
      console.error('Error liking recipe:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !comment.trim()) return;

    try {
      await jqueryAPI.recipe.addComment(id, { text: comment });
      setComment('');
      fetchRecipe();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) return <Loading />;
  if (!recipe) return <div>Recipe not found</div>;

  const isLiked = recipe.likes?.some(like => like._id === user?._id);

  return (
    <div className="recipe-detail-container">
      <div className="recipe-header">
        <h1>{recipe.title}</h1>
        <div className="recipe-meta-header">
          <span>{recipe.cuisine}</span>
          <span>{recipe.difficulty}</span>
          <span>⏱️ {recipe.prepTime + recipe.cookTime} min</span>
        </div>
      </div>


      <div className="recipe-content">
        <div className="recipe-section">
          <h2>About This Recipe</h2>
          <p>{recipe.description}</p>
        </div>

        <div className="recipe-section">
          <h2>Ingredients</h2>
          <div className="recipe-ingredients">
            {recipe.ingredients.map((ing, idx) => (
              <div key={idx} className="ingredient-item">
                • {ing.amount} {ing.unit} {ing.name}
              </div>
            ))}
          </div>
        </div>

        <div className="recipe-section">
          <h2>Instructions</h2>
          <div className="recipe-instructions">
            <ol className="instructions-list">
              {recipe.instructions.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="recipe-actions">
          <button
            onClick={handleLike}
            className={`btn-like ${isLiked ? 'liked' : ''}`}
          >
            {isLiked ? '❤️' : '🤍'} {recipe.likes?.length || 0}
          </button>
        </div>

        <div className="recipe-comments">
          <h2>Comments ({recipe.comments?.length || 0})</h2>
          
          {isAuthenticated && (
            <form onSubmit={handleComment} className="comment-form">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
              />
              <button type="submit" className="btn-primary">Post</button>
            </form>
          )}

          <div className="comments-list">
            {recipe.comments?.map(comment => (
              <div key={comment._id} className="comment-item">
                <strong>{comment.user.username}</strong>
                <p>{comment.text}</p>
                <small>{new Date(comment.createdAt).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
