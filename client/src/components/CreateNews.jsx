import React, { useState } from 'react';
import axiosInstance from '../utils/axiosInstance';

export default function CreateNews() {
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [images, setImages] = useState('');
    const [tags, setTags] = useState('');
    const [author, setAuthor] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !text || !images || !tags || !author) {
            setModalContent('All fields are required.');
            setShowModal(true);
            return;
        }
        try {
            const response = await axiosInstance.post('/api/news', { title, text, images: images.split(','), tags: tags.split(','), author });
            setModalContent('News created successfully!');
            setShowModal(true);
            console.log('News created:', response.data);
            setTitle('');
            setText('');
            setImages('');
            setTags('');
            setAuthor('');
        } catch (error) {
            setModalContent('Error creating news. Please try again.');
            setShowModal(true);
            console.error('Error creating news:', error);
        }
    };

    const handleTagsChange = (e) => {
        const value = e.target.value;
        if (/^[a-zA-Z0-9,]*$/.test(value)) {
            setTags(value);
        }
    };

    return (
        <div className="container mx-auto mt-5">
            <h2 className="text-2xl font-bold mb-4">Create News</h2>
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
                        onChange={(e) => setText(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Images (comma separated URLs):</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border rounded"
                        value={images}
                        onChange={(e) => setImages(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Tags (comma separated):</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border rounded"
                        value={tags}
                        onChange={handleTagsChange}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700">Author:</label>
                    <input
                        type="text"
                        className="w-full px-3 py-2 border rounded"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">Create</button>
            </form>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="bg-white p-4 rounded">
                        <h3 className="text-lg font-bold mb-2">Notification</h3>
                        <p>{modalContent}</p>
                        <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer" onClick={() => setShowModal(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}