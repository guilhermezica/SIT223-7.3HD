// No need to import react anymore
import './TutorialCard.css'
import { Star } from 'lucide-react'

export type TutorialCardProps = {
    image: string
    name: string
    description: string
    rating: number
    username: string
}

export const TutorialCard = ({ image, name, description, rating, username }: TutorialCardProps) => {
  return (
    <div className="card">
      <img src={image} alt={name} />
      <h2>{name}</h2>
      <p>{description}</p>
      <div className="rating">
        <Star size={16} fill="olive" color="olive" />
        <span>{rating}</span>
      </div>
      <p>{username}</p>
    </div>
  )
}