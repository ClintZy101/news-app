import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import useUserStore from '../store/userStore';

export default function CreateNews() {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [images, setImages] = useState(['']);
    const [tags, setTags] = useState(['']);
    const [author, setAuthor] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState('');
    const user = useUserStore((state) => state.user);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            setAuthor(user.email);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !text || !images.length || !tags.length || !author) {
            setModalContent('All fields are required.');
            setShowModal(true);
            return;
        }
        try {
            const response = await axiosInstance.post('/api/news', { title, text, images, tags, author });
            setModalContent('News created successfully!');
            setShowModal(true);
            console.log('News created:', response.data);
            setTitle('');
            setText('');
            setImages(['']);
            setTags(['']);
            setAuthor(user.email);
        } catch (error) {
            setModalContent('Error creating news. Please try again.');
            setShowModal(true);
            console.error('Error creating news:', error);
        }
    };

    const handleImageChange = (index, value) => {
        const newImages = [...images];
        newImages[index] = value;
        setImages(newImages);
    };

    const handleTagChange = (index, value) => {
        const newTags = [...tags];
        newTags[index] = value;
        setTags(newTags);
    };

    const addImageField = () => {
        setImages([...images, '']);
    };

    const addTagField = () => {
        setTags([...tags, '']);
    };

    const removeImageField = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
    };

    const removeTagField = (index) => {
        const newTags = tags.filter((_, i) => i !== index);
        setTags(newTags);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        navigate('/admin-panel');
    };

    return (
        <div className="container mx-auto mt-5 pb-10">
            <div className='flex w-full justify-center'> <h2 className="text-2xl font-bold mb-4 ">Create News</h2></div>
           
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700">Title:</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border rounded"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Text:</label>
                    <textarea
                        className="w-full px-3 py-2 border rounded"
                        value={text}
                        rows={15}
                        onChange={(e) => setText(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Images</label>
                    {images.map((image, index) => (
                        <div key={index} className="flex items-center mb-2">
                            <input
                                type="text"
                                value={image}
                                onChange={(e) => handleImageChange(index, e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                            <button type="button" onClick={() => removeImageField(index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2 focus:outline-none focus:shadow-outline">Remove</button>
                        </div>
                    ))}
                    <button type="button" onClick={addImageField} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add Image</button>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Tags</label>
                    {tags.map((tag, index) => (
                        <div key={index} className="flex items-center mb-2">
                            <input
                                type="text"
                                value={tag}
                                onChange={(e) => handleTagChange(index, e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                            <button type="button" onClick={() => removeTagField(index)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-2 focus:outline-none focus:shadow-outline">Remove</button>
                        </div>
                    ))}
                    <button type="button" onClick={addTagField} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Add Tag</button>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Author:</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border rounded"
                        value={author}
                        readOnly
                    />
                </div>
                <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded cursor-pointer w-full">Create</button>
            </form>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 ">
                    <div className="bg-white p-10 justify-center grid rounded">
                        <h3 className="text-lg font-bold mb-2">Notification</h3>
                        <p>{modalContent}</p>
                        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer" onClick={handleCloseModal}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}