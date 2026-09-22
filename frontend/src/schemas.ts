import { z } from 'zod' // Import the Zod library for schema validation

const transformTags = (value: string) => value.split(',').map((tag) => tag.trim()).filter((tag) => tag !== '')

const questionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  tags: z.string().transform(transformTags).pipe(z.array(z.string()).min(1, 'At least one tag is required').max(3, 'You can only add up to 3 tags')),
  plan: z.enum(['free', 'paid']),
})

const articleSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long'),
  abstract: z.string().min(20, 'Abstract must be at least 20 characters long'),
  text: z.string().min(100, 'Text must be at least 100 characters long'),
  // The errors for the tags field will be stored in formState.errors.tags, 
  // and you can access them in the same way as the other fields. 
  // For example, you can display the error message for the tags field like this:
  tags: z.string().transform(transformTags).pipe(z.array(z.string()).min(1, 'At least one tag is required').max(3, 'You can only add up to 3 tags')),
  plan: z.enum(['free', 'paid']),
})

export { questionSchema, articleSchema }