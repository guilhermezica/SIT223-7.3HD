import { ArticleCard, type ArticleCardProps } from "./ArticleCard";
import articleImage1 from '../assets/image1.jpg'
import articleImage2 from '../assets/image2.jpg'
import articleImage3 from '../assets/image3.jpg'

type Article = ArticleCardProps & { id: number }

const articles: Article[] = [
    {
        image: articleImage1,
        name: 'Article 1',
        description: 'Description 1',
        rating: 5,
        author: 'John Doe',
        id: 1
    },
    {
        image: articleImage2,
        name: 'Article 2',
        description: 'Description 2',
        rating: 4,
        author: 'Jane Doe',
        id: 2
    },
    {
        image: articleImage3,
        name: 'Article 3',
        description: 'Description 3',
        rating: 3,
        author: 'Bob Smith',
        id: 3
    }]

    const FeaturedArticles = () => {
        return (
            <div className="featured-articles">
                <div className="sectionTitle">
                    <h2>Featured Articles</h2>
                </div>
                <div className="article-list">
                    {articles.map(({ id, ...cardProps }) => (
                        <ArticleCard key={id} {...cardProps} />
                    ))}
                </div>
                <button>
                    View All Articles
                </button>
            </div>

        )
    }    

export default FeaturedArticles
