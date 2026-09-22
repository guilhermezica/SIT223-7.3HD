// No need to import react anymore
import './ArticleCard.css'
import { Star } from 'lucide-react'

export type ArticleCardProps = {
    image: string
    name: string
    description: string
    rating: number
    author: string
}

export const ArticleCard = ({ image, name, description, rating, author }: ArticleCardProps) => {
  return (
    <div className="card">
      <img src={image} alt={name}/>
      <h2>{name}</h2>
      <p>{description}</p>
      <div className="rating">
        <Star size={16} fill="olive" color="olive" />
        <span>{rating}</span>
      </div>
      <p>{author}</p>
    </div>
  )
}