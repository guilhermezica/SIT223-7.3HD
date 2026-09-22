import { TutorialCard, type TutorialCardProps } from "./TutorialCard";
import TutorialImage4 from "../assets/image4.jpg"
import TutorialImage5 from "../assets/image5.jpg"
import TutorialImage6 from "../assets/image6.jpg"

type Tutorial = TutorialCardProps & { id: number }

const tutorials: Tutorial[] = [
    {
        image: TutorialImage4,
        name: 'Tutorial 1',
        description: 'Description 1',
        rating: 5,
        username: 'John Doe',
        id: 1
    },
    {
        image: TutorialImage5,
        name: 'Tutorial 2',
        description: 'Description 2',
        rating: 4,
        username: 'Jane Doe',
        id: 2
    },
    {
        image: TutorialImage6,
        name: 'Tutorial 3',
        description: 'Description 3',
        rating: 3,
        username: 'Bob Smith',
        id: 3
    }]

    const FeaturedArticles = () => {
        return (
            <div className="featured-tutorials">
                <div className="sectionTitle">
                    <h2>Featured Tutorials</h2>
                </div>
                <div className="tutorial-list">
                    {tutorials.map(({ id, ...cardProps }) => (
                        <TutorialCard key={id} {...cardProps} />
                    ))}
                </div>
                <button>
                    View All Tutorials
                </button>
            </div>

        )
    }    

export default FeaturedArticles
