"use client"; // Required for Next.js client components

import { useEffect, useState } from "react";

export default function NotionData() {
  const [documents, setDocuments] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("documents");

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    setLoading(true);
    try {
      const response = await fetch("/api/notion?type=document");
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const notionData = await response.json();

      const formattedData = notionData.map((page) => ({
        id: page.id,
        title: page.properties["Title"]?.title[0]?.plain_text ||
          page.properties["Documents filed"]?.title[0]?.plain_text ||
          "Untitled",
        url: page.url,
        date: page.properties["Date"]?.date?.start || "No date",
      }));

      setDocuments(formattedData);
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
    setLoading(false);
  }

  async function fetchBlogPosts() {
    setLoading(true);
    try {
      const response = await fetch("/api/notion?type=blog");
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const notionData = await response.json();

      const formattedData = notionData.map((page) => ({
        id: page.id,
        title: page.properties["Title"]?.title[0]?.plain_text ||
          page.properties["Name"]?.title[0]?.plain_text ||
          "Untitled",
        url: page.url,
        date: page.properties["PublishedDate"]?.date?.start || "No date",
      }));

      setBlogPosts(formattedData);
    } catch (err) {
      console.error("Error fetching blog posts:", err);
    }
    setLoading(false);
  }

  async function fetchSinglePage(pageId) {
    setLoading(true);
    try {
      const response = await fetch(`/api/notion?pageId=${pageId}`);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const pageData = await response.json();
      setSelectedPage({ id: pageId, blocks: pageData });
    } catch (error) {
      console.error("Error fetching Notion page:", error.message);
      setSelectedPage(null);
    }
    setLoading(false);
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "documents" && documents.length === 0) {
      fetchDocuments();
    } else if (tab === "blog" && blogPosts.length === 0) {
      fetchBlogPosts();
    }
  };

  const currentData = activeTab === "documents" ? documents : blogPosts;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Notion Content</h1>

      <div className="flex justify-center border-b mb-6 space-x-6">
        {['documents', 'blog'].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`py-2 px-6 rounded-t-lg font-semibold transition-all ${activeTab === tab ? "border-b-4 border-blue-500 text-blue-500" : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500 text-center">Loading...</p>}

      {selectedPage && (
        <div className="p-6 border border-gray-300 shadow-md rounded-lg bg-white mb-6">
          <h2 className="text-xl font-semibold mb-4">Page Content</h2>
          <button
            onClick={() => setSelectedPage(null)}
            className="text-sm text-gray-500 underline mb-4 block"
          >
            Back to list
          </button>
          <div className="mt-4 space-y-4">
            {selectedPage.blocks.map((block, index) => {
              if (block.type === "paragraph") {
                return <p key={index} className="text-gray-700">{block.paragraph.rich_text.map(text => text.plain_text).join(' ')}</p>;
              } else if (block.type.startsWith("heading_")) {
                const HeadingTag = `h${block.type.split("_")[1]}`;
                return <HeadingTag key={index} className="font-bold text-gray-800">{block[block.type].rich_text.map(text => text.plain_text).join(' ')}</HeadingTag>;
              }
              return null;
            })}
          </div>
        </div>
      )}

      {!selectedPage && !loading && (
        <div className="overflow-x-auto">
          <table className="w-full bg-white border border-gray-300 shadow-md rounded-lg">
            <thead>
              <tr className="bg-blue-100 text-gray-700 text-sm uppercase">
                <th className="py-3 px-6 text-left">Title</th>
                <th className="py-3 px-6 text-left">Date</th>
                <th className="py-3 px-6 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentData.length > 0 ? (
                currentData.map((item) => (
                  <tr key={item.id} className="border-b border-gray-300 hover:bg-gray-100">
                    <td className="py-3 px-6">{item.title}</td>
                    <td className="py-3 px-6">{item.date}</td>
                    <td className="py-3 px-6 flex space-x-4">
                      <button onClick={() => fetchSinglePage(item.id)} className="text-blue-500 hover:text-blue-700">View</button>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">Open</a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" className="py-4 px-6 text-center text-gray-500">No data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
