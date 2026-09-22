import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { fetchPosts, type Post } from '../api/posts'
import './BrowsePage.css'


type TypeFilter = 'any' | 'article' | 'question'
type PlanFilter = 'any' | 'free' | 'paid'
type PeriodFilter = 'any' | 'week' | 'month' | 'year'

const PERIOD_DAYS: Record<Exclude<PeriodFilter, 'any'>, number> = {
    week: 7,
    month: 30,
    year: 365,
}

const POST_PREVIEW_LENGTH = 240

const isWithinPeriod = (createdAt: string, period: Exclude<PeriodFilter, 'any'>) => {
    const cutoff = Date.now() - PERIOD_DAYS[period] * 24 * 60 * 60 * 1000
    return new Date(createdAt).getTime() >= cutoff
}


function BrowsePage() {
    const { user, plan, isAuthLoading, isPlanLoading } = useAuth()
    const [posts, setPosts] = useState<Post[] | null>(null)
    const [error, setError] = useState('')
    
    const [typeFilter, setTypeFilter] = useState<TypeFilter>('any')
    const [planFilter, setPlanFilter] = useState<PlanFilter>('any')
    const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('any')
    const [tagQuery, setTagQuery] = useState('')
    
    // Only one post is open at a time, so a single id is enough. null means all collapsed.
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set())
    
    // Refetch when the plan changes too, so upgrading swaps the feed without a reload.
    useEffect(() => {
        if (isAuthLoading || isPlanLoading) return
        
        let cancelled = false
        fetchPosts(user).then((result) => {
            if (cancelled) return
            setPosts(result.posts)
            setError(result.ok ? '' : result.message ?? 'Unable to load posts.')
        })
        
        return () => { cancelled = true }
    }, [user, plan, isAuthLoading, isPlanLoading])
    
    const isLoading = isAuthLoading || isPlanLoading || posts === null
    
    const viewingAs = !user ? 'Guest' : plan === 'paid' ? 'Premium' : 'Free'
    
    const trimmedTag = tagQuery.trim().toLowerCase()
    const hasActiveFilter =
    typeFilter !== 'any' || planFilter !== 'any' || periodFilter !== 'any' || trimmedTag !== ''
    // The reset button also undoes hiding and expanding, not just the filters.
    const canReset = hasActiveFilter || hiddenIds.size > 0 || expandedId !== null
    
    const visiblePosts = (posts ?? []).filter((post) => {
        if (hiddenIds.has(post.id)) return false
        if (typeFilter !== 'any' && post.type !== typeFilter) return false
        if (planFilter !== 'any' && post.plan !== planFilter) return false
        if (periodFilter !== 'any' && (!post.createdAt || !isWithinPeriod(post.createdAt, periodFilter))) return false
        if (trimmedTag && !post.tags?.some((tag) => tag.toLowerCase().includes(trimmedTag))) return false
        return true
    })
    // If the user logs out, we want to reset all filters and hidden/expanded state. This is because the posts available to a guest are different from those available to a logged-in user, so we need to clear any state that was specific to the previous user.
    useEffect(() => {
        if (isAuthLoading) return
        if (user !== null) return
    
        setTypeFilter('any')
        setPlanFilter('any')
        setPeriodFilter('any')
        setTagQuery('')
        setHiddenIds(new Set())
        setExpandedId(null)
    }, [user, isAuthLoading])

    const toggleExpanded = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id))
    }

    const hidePost = (id: string) => {
        // A Set mutated with .add() keeps the same identity, so React would skip the
        // re-render. Copy, add to the copy, store the copy — replace, never mutate.
        setHiddenIds((prev) => { 
            const next = new Set(prev)
            next.add(id)
            return next
        })
        // A hidden post cannot stay the expanded one.
        setExpandedId((prev) => (prev === id ? null : prev))
    }

    const resetAll = () => {
        setTypeFilter('any')
        setPlanFilter('any')
        setPeriodFilter('any')
        setTagQuery('')
        setHiddenIds(new Set())
        setExpandedId(null)
    }

    return (
        <main className="browse">
            <header className="browse-header">
                <h1>Browse</h1>
                <p className="viewing-as">
                    Viewing as <strong>{viewingAs}</strong>
                    {viewingAs !== 'Premium' && ' — premium posts are hidden'}
                </p>
            </header>

            <div className="filter-bar">
                <div className="filter">
                    <label htmlFor="filter-type">Type</label>
                    <select
                        id="filter-type"
                        value={typeFilter}
                        onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
                    >
                        <option value="any">Any type</option>
                        <option value="article">Articles</option>
                        <option value="question">Questions</option>
                    </select>
                </div>
                {/* We should only display the plan filter if the user has a premium plan, otherwise it is confusing to show a filter that they cannot use. This is because the API will only return free posts for free users, so the plan filter is not relevant for them. */}
                {plan === 'paid' && (
                    <div className="filter">
                        <label htmlFor="filter-plan">Plan</label>
                        <select
                            id="filter-plan"
                            value={planFilter}
                            onChange={(event) => setPlanFilter(event.target.value as PlanFilter)}
                        >
                            <option value="any">Any plan</option>
                            <option value="free">Free</option>
                            <option value="paid">Premium</option>
                        </select>
                    </div>
                )}

                <div className="filter">
                    <label htmlFor="filter-period">Posted</label>
                    <select
                        id="filter-period"
                        value={periodFilter}
                        onChange={(event) => setPeriodFilter(event.target.value as PeriodFilter)}
                    >
                        <option value="any">Any time</option>
                        <option value="week">Past week</option>
                        <option value="month">Past month</option>
                        <option value="year">Past year</option>
                    </select>
                </div>

                <div className="filter filter-tag">
                    <label htmlFor="filter-tag">Tag</label>
                    <input
                        id="filter-tag"
                        type="search"
                        placeholder="Any tag"
                        value={tagQuery}
                        onChange={(event) => setTagQuery(event.target.value)}
                    />
                </div>

                {canReset && (
                    <button type="button" className="clear-filters" onClick={resetAll}>
                        Reset
                    </button>
                )}
            </div>

            {isLoading && <p>Loading posts...</p>}
            {error && <p className="browse-error" role="alert">{error}</p>}

            {!isLoading && !error && (
                <p className="result-count">
                    {hasActiveFilter || hiddenIds.size > 0
                        ? `${visiblePosts.length} of ${posts?.length ?? 0} posts`
                        : `${visiblePosts.length} posts`}
                    {hiddenIds.size > 0 && ` · ${hiddenIds.size} hidden`}
                </p>
            )}

            {!isLoading && !error && posts?.length === 0 && (
                <p>No posts to show yet.</p>
            )}

            {!isLoading && !error && (posts?.length ?? 0) > 0 && visiblePosts.length === 0 && (
                <p>{hasActiveFilter ? 'No posts match these filters.' : 'Every post is hidden.'}</p>
            )}

            <ul className="post-list">
                {visiblePosts.map((post) => {
                    const preview = post.abstract ?? post.description ?? ''
                    const full = post.text ?? post.description ?? ''
                    const isExpanded = expandedId === post.id
                    const canExpand = full.length > POST_PREVIEW_LENGTH || full !== preview

                    return (
                        <li key={post.id} className="post-item">
                            <div className="post-item-head">
                                <h2>{post.title}</h2>
                                <span className={`plan-badge plan-badge-${post.plan}`}>
                                    {post.plan === 'paid' ? 'Premium' : 'Free'}
                                </span>
                                <button
                                    type="button"
                                    className="hide-post"
                                    onClick={() => hidePost(post.id)}
                                    aria-label={`Hide ${post.title}`}
                                >
                                    Hide
                                </button>
                            </div>
                            <p className="post-type">
                                {post.type} ·{' '}{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown date'}
                            </p>
                            <p className={`post-body ${!isExpanded ? 'post-body-collapsed' : ''}`}>
                                {isExpanded && canExpand ? full : preview}
                            </p>
                            <ul className="tag-list">
                                {post.tags?.map((tag) => <li key={tag}>{tag}</li>)}
                            </ul>
                            {canExpand && (
                                <button
                                    type="button"
                                    className="expand-post"
                                    onClick={() => toggleExpanded(post.id)}
                                    aria-expanded={isExpanded}
                                >
                                    {isExpanded ? 'Show less' : 'Read more...'}
                                </button>
                            )}
                        </li>
                    )
                })}
            </ul>
        </main>
    )
}

export default BrowsePage
