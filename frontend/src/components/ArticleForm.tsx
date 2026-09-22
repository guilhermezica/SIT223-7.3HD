import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { articleSchema } from '../schemas'
import { useAuth } from '../context/AuthContext'
import { createPost } from '../api/posts'
import { toast } from 'sonner'
import './PostForm.css'
import { z } from 'zod'

function ArticleForm() {
    const { user } = useAuth()
    const { register, handleSubmit, reset, formState } = useForm({
        mode: 'onBlur', // Added onBlur mode to trigger validation when the user leaves the input field
        resolver: zodResolver(articleSchema),
        defaultValues: { plan: 'free' as const }
    })

    const onSubmit = async (data: z.infer<typeof articleSchema>) => { // Update the function signature
        if (!user) { // Check if the user is logged in before allowing them to submit an article
            toast.error('You must be logged in to create a post.')
            return
        }

        try {
            const result = await createPost(user, {
                ...data,
                type: 'article',
            })
            if (!result.ok) {
                toast.error(result.message ?? 'Unable to post your article.')
                return
            }
            toast.success('Article posted successfully.') // Show a success message to the user
            reset() // Reset the form fields after successful submission
        } catch (error) { // Catch any errors that occur during the submission process
            console.error('Error creating article:', error) // Log the error to the console for debugging purposes
            toast.error('Unable to post your article. Please try again.') // Show an error message to the user if the submission fails
        }
    }

    return ( 
        <form 
            className="post-form"
            onSubmit={handleSubmit(onSubmit)} // Attach the onSubmit handler to the form's submit event
        >
            <h2>Write an Article</h2>

            <div className="field">
                <label htmlFor="a-title">Title</label>
                {/* Update the input element to use the register function */}
                <input id="a-title" type="text" placeholder="Title" {...register('title')} /> 
                {/*  Error message for the title field */}
                {formState.errors.title && <p className="error">{formState.errors.title.message}</p>}
            </div>

            <div className="field">
                <label htmlFor="a-abstract">Abstract</label>
                <textarea id="a-abstract" placeholder="Abstract" rows={3} {...register('abstract')} />
                {formState.errors.abstract && <p className="error">{formState.errors.abstract.message}</p>}
            </div>

            <div className="field">
                <label htmlFor="a-text">Article Text</label>
                <textarea id="a-text" placeholder="Article Text" rows={8} {...register('text')} />
                {formState.errors.text && <p className="error">{formState.errors.text.message}</p>}
            </div>

            <div className="field">
                <label htmlFor="a-tags">Tags</label>
                <input id="a-tags" type="text" placeholder="Tags separated by commas" {...register('tags')} />
                {formState.errors.tags && <p className="error">{formState.errors.tags.message}</p>}
            </div>

            <div className="field">
                <label>Select Post Plan</label>
                <div className="plan-options">
                    <label>
                        <input type="radio" value="free" {...register('plan')} />
                        Free
                    </label>
                    <label>
                        <input type="radio" value="paid" {...register('plan')} />
                        Paid
                    </label>
                </div>
                {formState.errors.plan && <p className="error">{formState.errors.plan.message}</p>}
            </div>

            <button type="submit">Post</button>
        </form>
    )
}

export default ArticleForm
