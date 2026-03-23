# 🎨 UI/UX Quick Reference Guide

## 🚀 Quick Start

All UI/UX components are ready to use. Here's how to use them in your existing pages:

---

## 1. Dark Mode

### Toggle in Navbar (✅ Already added)
The theme toggle is already in the navbar. Users can click to switch themes.

### Use in Components
```jsx
import { useTheme } from '@/context/ThemeContext';

const { darkMode, toggleDarkMode } = useTheme();

// Conditional rendering based on theme
{darkMode ? <DarkModeIcon /> : <LightModeIcon />}
```

### Apply Dark Styles
```jsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Automatically adapts!
</div>
```

---

## 2. Toast Notifications

### Show Success
```jsx
import toast from 'react-hot-toast';

toast.success('Profile updated successfully!');
```

### Show Error
```jsx
toast.error('Failed to save changes');
```

### Show Loading
```jsx
const toastId = toast.loading('Saving...');
// Later:
toast.success('Saved!', { id: toastId });
```

### Custom Duration
```jsx
toast('Custom message', { duration: 6000 });
```

---

## 3. Loading Skeletons

### Session Loading
```jsx
import { SessionSkeleton } from '@/components/Skeleton';

{loading ? <SessionSkeleton /> : <SessionCard data={session} />}
```

### Tutor Card Loading
```jsx
import { TutorCardSkeleton } from '@/components/Skeleton';

{loading ? (
  <div className="grid md:grid-cols-3 gap-4">
    <TutorCardSkeleton />
    <TutorCardSkeleton />
    <TutorCardSkeleton />
  </div>
) : (
  <TutorGrid tutors={tutors} />
)}
```

### Multiple Skeletons
```jsx
import { SearchResultsSkeleton, PageSkeleton } from '@/components/Skeleton';

{loading ? <SearchResultsSkeleton /> : <Results />}
{loading ? <PageSkeleton /> : <FullPage />}
```

---

## 4. Animations

### Animated Card
```jsx
import { AnimatedCard } from '@/components/AnimatedCard';

<AnimatedCard className="p-6">
  <h2>Animated Content</h2>
</AnimatedCard>
```

### Fade In
```jsx
import { FadeIn } from '@/components/AnimatedCard';

<FadeIn delay={0.2}>
  <Welcome />
</FadeIn>
```

### Slide In
```jsx
import { SlideIn } from '@/components/AnimatedCard';

<SlideIn direction="up" delay={0.3}>
  <Hero />
</SlideIn>
```

### Stagger List
```jsx
import { StaggerContainer, StaggerItem } from '@/components/AnimatedCard';

<StaggerContainer>
  {items.map(item => (
    <StaggerItem key={item.id}>
      <Card {...item} />
    </StaggerItem>
  ))}
</StaggerContainer>
```

---

## 5. Form Validation

### Basic Setup
```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'At least 6 characters'),
});

const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
  resolver: zodResolver(schema)
});

const onSubmit = async (data) => {
  try {
    await api.login(data);
    toast.success('Logged in!');
  } catch (err) {
    toast.error(err.message);
  }
};
```

### Form JSX
```jsx
<form onSubmit={handleSubmit(onSubmit)}>
  <input {...register('email')} className="..." />
  {errors.email && <p className="text-red-500">{errors.email.message}</p>}

  <button disabled={isSubmitting}>
    {isSubmitting ? 'Loading...' : 'Submit'}
  </button>
</form>
```

---

## 6. Common Patterns

### Loading State Pattern
```jsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetchData()
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, []);

if (loading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;
return <DataDisplay data={data} />;
```

### Form Submit Pattern
```jsx
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    await api.save(formData);
    toast.success('Saved!');
  } catch (err) {
    toast.error('Failed to save');
  } finally {
    setIsSubmitting(false);
  }
};
```

### Animated List Pattern
```jsx
import { AnimatedCard } from '@/components/AnimatedCard';

<div className="space-y-4">
  {items.map((item, index) => (
    <AnimatedCard key={item.id} style={{ animationDelay: `${index * 0.1}s` }}>
      <ItemContent {...item} />
    </AnimatedCard>
  ))}
</div>
```

---

## 7. Styling Shortcuts

### Dark Mode Variants
```jsx
// Background
bg-white dark:bg-gray-900

// Text
text-gray-900 dark:text-white

// Borders
border-gray-200 dark:border-gray-700

// Inputs
bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600
```

### Common Button Styles
```jsx
// Primary
className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"

// Secondary
className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg"

// Danger
className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"

// Disabled
className="... disabled:opacity-50 disabled:cursor-not-allowed"
```

### Common Card Styles
```jsx
className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
```

---

## 8. Examples for Specific Pages

### Dashboard
```jsx
import { PageSkeleton } from '@/components/Skeleton';
import { AnimatedCard } from '@/components/AnimatedCard';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetchSessions()
      .then(setSessions)
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSkeleton />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {sessions.map(session => (
          <AnimatedCard key={session.id} className="p-6">
            <h2>{session.title}</h2>
          </AnimatedCard>
        ))}
      </div>
    </div>
  );
}
```

### Search/Matching Page
```jsx
import { TutorCardSkeleton } from '@/components/Skeleton';
import { StaggerContainer, StaggerItem } from '@/components/AnimatedCard';

export default function Search() {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => <TutorCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <StaggerContainer className="grid md:grid-cols-3 gap-4">
      {tutors.map(tutor => (
        <StaggerItem key={tutor.id}>
          <TutorCard {...tutor} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
```

### Profile Page
```jsx
import { SlideIn } from '@/components/AnimatedCard';
import toast from 'react-hot-toast';

export default function Profile() {
  const handleSave = async (data) => {
    try {
      await api.updateProfile(data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  return (
    <SlideIn direction="up">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
        <ProfileForm onSubmit={handleSave} />
      </div>
    </SlideIn>
  );
}
```

---

## 9. Accessibility Checklist

### Always Include
✅ `aria-label` for icon-only buttons
✅ `role="status"` for loading indicators
✅ `focus:ring-2 focus:ring-primary` for interactive elements
✅ Sufficient color contrast
✅ Keyboard navigation support

### Example
```jsx
<button
  onClick={handleClick}
  aria-label="Close modal"
  className="focus:outline-none focus:ring-2 focus:ring-primary"
>
  <CloseIcon />
</button>
```

---

## 10. Performance Tips

### Lazy Load Images
```jsx
<img src={url} loading="lazy" alt="..." />
```

### Debounce Search
```jsx
import { useState, useEffect } from 'react';

const [search, setSearch] = useState('');
const [debouncedSearch, setDebouncedSearch] = useState('');

useEffect(() => {
  const timer = setTimeout(() => setDebouncedSearch(search), 500);
  return () => clearTimeout(timer);
}, [search]);

useEffect(() => {
  if (debouncedSearch) fetchResults(debouncedSearch);
}, [debouncedSearch]);
```

### Memoize Expensive Calculations
```jsx
import { useMemo } from 'react';

const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.score - b.score);
}, [items]);
```

---

## 11. Common Pitfalls to Avoid

❌ **Don't** forget dark mode classes
✅ **Do** add `dark:` variants

❌ **Don't** show raw errors to users
✅ **Do** use toast.error() with user-friendly messages

❌ **Don't** render without loading states
✅ **Do** show skeletons while loading

❌ **Don't** animate everything
✅ **Do** use animations purposefully

❌ **Don't** ignore accessibility
✅ **Do** add aria labels and focus states

---

## 12. Testing Your UI

### Check Dark Mode
1. Click theme toggle in navbar
2. Verify all elements look good in both modes
3. Check localStorage persistence (refresh page)

### Check Toasts
```jsx
toast.success('Test success');
toast.error('Test error');
toast.loading('Test loading');
```

### Check Animations
1. Navigate between pages
2. Scroll through lists
3. Hover over cards
4. Check stagger effects

### Check Loading States
1. Throttle network in DevTools
2. Verify skeletons appear
3. Check smooth transition to content

---

## 13. File Locations

```
src/
├── context/
│   └── ThemeContext.jsx          ✅ Dark mode context
├── components/
│   ├── ThemeToggle.jsx            ✅ Theme toggle button
│   ├── Skeleton.jsx               ✅ 8+ skeleton variants
│   └── AnimatedCard.jsx           ✅ Animation components
├── App.tsx                        ✅ Updated with providers
└── index.css                      ✅ Dark mode CSS variables
```

---

## 14. Cheat Sheet

### Toast
```jsx
toast.success('Success!')
toast.error('Error!')
toast.loading('Loading...')
toast('Custom', { duration: 5000 })
```

### Theme
```jsx
const { darkMode, toggleDarkMode } = useTheme();
<ThemeToggle />
```

### Skeleton
```jsx
{loading ? <SessionSkeleton /> : <Session />}
```

### Animation
```jsx
<AnimatedCard />
<FadeIn delay={0.2} />
<SlideIn direction="up" />
<StaggerContainer><StaggerItem /></StaggerContainer>
```

### Form
```jsx
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
});
```

---

## 15. Next Steps

1. **Apply to Existing Pages**
   - Add loading skeletons to all data fetching
   - Use toasts for all user actions
   - Animate page entries

2. **Test Thoroughly**
   - Check dark mode on all pages
   - Verify loading states
   - Test form validation

3. **Optimize**
   - Remove unused animations
   - Optimize bundle size
   - Add lazy loading

---

**Quick Reference Version:** 1.0
**Last Updated:** March 23, 2026
**Status:** ✅ Ready to Use

**Happy coding! 🎉**
