import React from 'react'
import {sortBlogs} from '@/src/utils'
const FeaturedPosts = ({blogs}) => {
    const sortedBlogs = sortBlogs(blogs);
    const blog = sortedBlogs[0];
  return (
    <section className='w-full mt-32 px-32 flex flex-col items-center justify-center'>
        <h2 className='w-full inline-block font-bold capitalize text-4xl my-8'>Featured Posts</h2>
        <div className='grid gird-cols02 grid-rows-2 gap-6 mt-16'>
            <article className='col-span-1 row-span-2 relative'></article>
            <article></article>
        </div>
    </section>
    
  )
}

export default FeaturedPosts