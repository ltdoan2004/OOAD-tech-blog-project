import React from 'react'
import {sortBlogs} from '@/src/utils'
import BlogLayoutOne from '../Blog/BlogLayoutOne'
import BlogLayoutTwo from '../Blog/BlogLayoutTwo'
const RecentPosts = ({blogs}) => {
    const sortedBlogs = sortBlogs(blogs);
  return (
    <section className='w-full mt-32 px-32 flex flex-col items-center justify-center'>
        <h2 className='w-full inline-block font-bold capitalize text-4xl my-8'>
            Recent Posts
        </h2>
   
    </section>
    
  )
}

export default RecentPosts