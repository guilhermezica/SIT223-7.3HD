import { useEffect, useState } from 'react'
import QuestionForm from '../components/QuestionForm'
import ArticleForm from '../components/ArticleForm'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router'
import './NewPostPage.css'

function NewPostPage() {
  const [postType, setPostType] = useState<'question' | 'article'>('question') // State to track the selected post type, either 'question' or 'article'
  const { user, isAuthLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate('/login', { replace: true })
    }
  }, [isAuthLoading, user, navigate])

  if (isAuthLoading || !user) {
    return <p>Checking your login status...</p>
  }

  return (
    <div className="new-post-page">
      <h1>New Post</h1>
      <div className="post-type-select">
        <label>Select Post Type</label>
        <h2>What do you want to ask or share?</h2>
        <div className="post-type-options">
          <label className={postType === 'question' ? 'active' : ''}>
            <input
              type="radio"
              name="postType"
              value="question"
              checked={postType === 'question'} // Conditional check to determine if the radio button should be checked based on the selected post type
              onChange={() => setPostType('question')} // Update the state to 'question' when this radio button is selected
            />
            Question
          </label>
          <label className={postType === 'article' ? 'active' : ''}>
            <input
              type="radio"
              name="postType"
              value="article"
              checked={postType === 'article'} // Conditional check to determine if the selected post type is 'article'
              onChange={() => setPostType('article')} // Update the state to 'article' when this radio button is selected
            />
            Article
          </label>
        </div>
      </div>

      {/* Conditional rendering of the form based on the selected post type */}
      {postType === 'question' ? <QuestionForm /> : <ArticleForm />}
    </div>
  )
}

export default NewPostPage
