import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { questionSchema } from '../schemas'
import { useAuth } from '../context/AuthContext'
import { createPost } from '../api/posts'
import { toast } from 'sonner'
import './PostForm.css'
import { z } from 'zod'

function QuestionForm() {
    const { user } = useAuth()
    const { register, handleSubmit, reset, formState } = useForm({
        mode: 'onBlur', // Added onBlur mode to trigger validation when the user leaves the input field
        resolver: zodResolver(questionSchema),
        defaultValues: { plan: 'free' as const }
    })


    const onSubmit = async (data: z.infer<typeof questionSchema>) => {
        if (!user) {
            toast.error('You must be logged in to create a post.')
            return
        }

        try {
            const result = await createPost(user, {
                ...data,
                type: 'question',
            })
            if (!result.ok) {
                toast.error(result.message ?? 'Unable to post your question.')
                return
            }
            toast.success('Question posted successfully.')
            reset()
        } catch (error) {
            console.error('Error creating question:', error)
            toast.error('Unable to post your question. Please try again.')
        }
    }

    return (
        <form
            className="post-form"
            onSubmit={handleSubmit(onSubmit)}
        >
            <h2>Ask a Question</h2>
            <div className="field">
                <label htmlFor="q-title">Title</label>
                <input id="q-title" type="text" placeholder="Title" {...register('title')} />
                {formState.errors.title && <p className="error">{formState.errors.title.message}</p>}
            </div>

            <div className="field">
                <label htmlFor="q-description">Description</label>
                <textarea id="q-description" placeholder="Description" rows={4} {...register('description')} />
                {formState.errors.description && <p className="error">{formState.errors.description.message}</p>}
            </div>

            <div className="field">
                <label htmlFor="q-tags">Tags</label>
                <input id="q-tags" type="text" placeholder="Tags separated by commas" {...register('tags')} />
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

export default QuestionForm
