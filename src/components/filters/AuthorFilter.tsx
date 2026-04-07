// src/components/filters/AuthorFilter.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { searchPeople, getAuthorsByIds } from '@/services/mangadex';

interface AuthorFilterProps {
  selectedAuthors: string[]; 
  onChange: (authors: string[]) => void;
}

export default function AuthorFilter({ selectedAuthors, onChange }: AuthorFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchInitialDetails = async () => {
      if (selectedAuthors.length > 0 && selectedDetails.length === 0) {
        const data = await getAuthorsByIds(selectedAuthors);
        if (data) setSelectedDetails(data);
      }
    };
    fetchInitialDetails();
  }, [selectedAuthors]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (searchTerm.trim().length === 0) {
        setSearchResults([]); 
        return;
      }
      setIsLoading(true);
      const data = await searchPeople(searchTerm);
      setSearchResults(data || []);
      setIsLoading(false);
    }, 500);
  }, [searchTerm, isOpen]);

  const toggleAuthor = (authorObj: any) => {
    const id = authorObj.id;
    const isAlreadySelected = selectedAuthors.includes(id);

    if (isAlreadySelected) {
        onChange(selectedAuthors.filter(a => a !== id));
        setSelectedDetails(prev => prev.filter(p => p.id !== id));
    } else {
        onChange([...selectedAuthors, id]);
        if (!selectedDetails.find(p => p.id === id)) {
            setSelectedDetails(prev => [...prev, authorObj]);
        }
    }
  };

  const getLabel = () => {
    if (selectedAuthors.length === 0) return 'Any';
    if (selectedAuthors.length === 1 && selectedDetails.length > 0) return selectedDetails[0].attributes.name;
    return `${selectedAuthors.length} Selected`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">Authors</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#232529] border border-[#3b3e44] rounded px-3 py-2 text-sm text-gray-200 focus:border-orange-500 cursor-pointer h-10 flex items-center justify-between select-none"
      >
        <span className="truncate pr-2">{getLabel()}</span>
        <span className="text-[10px] text-gray-400">▼</span>
      </div>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-[#232529] border border-[#3b3e44] rounded shadow-2xl overflow-hidden flex flex-col max-h-96">
          <div className="p-2 border-b border-[#3b3e44] bg-[#232529] sticky top-0 z-10">
            <div className="relative flex items-center">
                <span className="absolute left-2 text-3xl top-center text-gray-500">⌕</span>
                <input 
                    type="text"
                    placeholder="Search author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#191A1C] border border-[#3b3e44] rounded pl-8 pr-2 py-1 text-xs text-white focus:border-orange-500 outline-none"
                    autoFocus
                />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 p-1 min-h-[100px]">
            {selectedDetails.length > 0 && (
                <div className="mb-2 border-b border-white/5 pb-2">
                    <div className="px-2 py-1 text-[10px] font-bold text-orange-500 uppercase tracking-wider">Selected</div>
                    {selectedDetails.map(author => (
                        <div 
                          key={author.id}
                          onClick={() => toggleAuthor(author)} 
                          className="px-2 py-2 text-sm bg-orange-500/10 hover:bg-red-500/20 cursor-pointer flex items-center gap-3 transition-colors rounded mb-0.5 group"
                        >
                           <div className="w-4 h-4 rounded-full border border-orange-600 bg-orange-600 flex items-center justify-center flex-shrink-0 group-hover:border-red-500 group-hover:bg-red-500">
                              <span className="text-white text-[10px] font-bold">✓</span>
                           </div>
                           <span className="text-white font-medium group-hover:text-red-200 line-clamp-1">
                             {author.attributes.name}
                           </span>
                           <span className="ml-auto text-[10px] text-gray-400 group-hover:text-red-300">✕</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="px-2 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                {searchTerm ? 'Search Results' : 'Type to search...'}
            </div>
            
            {isLoading ? (
                <div className="text-center py-4 text-xs text-gray-500">Searching...</div>
            ) : searchResults.length > 0 ? (
                searchResults
                  .filter(res => !selectedAuthors.includes(res.id)) 
                  .map((author) => (
                    <div 
                      key={author.id}
                      onClick={() => toggleAuthor(author)} 
                      className="px-2 py-2 text-sm hover:bg-[#3b3e44] cursor-pointer flex items-center gap-3 transition-colors rounded"
                    >
                       <div className="w-4 h-4 rounded-full border border-gray-500 bg-transparent flex items-center justify-center flex-shrink-0">
                       </div>
                       <span className="text-gray-300">
                         {author.attributes.name}
                       </span>
                    </div>
                ))
            ) : (
                searchTerm && <div className="p-4 text-center text-xs text-gray-500">No author found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}