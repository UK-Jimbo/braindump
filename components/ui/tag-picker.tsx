import React, { useState, useRef, useEffect } from 'react';

// Define types for tag and grouping structure
type Tag = {
  id: number;
  name: string;
  group: string; // Group name (e.g., "Programming", "Libraries")
};

type GroupedTags = {
  [groupName: string]: Tag[]; // Grouping by the group name
};

// Mock data for testing
const mockTags: Tag[] = [
  { id: 1, name: 'JavaScript', group: 'Programming' },
  { id: 2, name: 'Python', group: 'Programming' },
  { id: 3, name: 'React', group: 'Libraries' },
  { id: 4, name: 'Node.js', group: 'Backend' },
  { id: 5, name: 'CSS', group: 'Web Design' },
  { id: 6, name: 'HTML', group: 'Web Design' },
  { id: 7, name: 'GraphQL', group: 'Libraries' },
];

// Tag Picker Component
const TagPicker: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>(mockTags); // Dynamic tag list
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]); // Selected tags
  const [filteredTags, setFilteredTags] = useState<Tag[]>(mockTags); // Filtered list
  const [searchTerm, setSearchTerm] = useState(''); // Search input state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // To toggle dropdown visibility
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null); // Track highlighted tag
  const inputRef = useRef<HTMLInputElement>(null); // For focus management

  // Filter tags based on the search term
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchTerm(query);
    setFilteredTags(tags.filter(tag => tag.name.toLowerCase().includes(query)));
    setIsDropdownOpen(true); // Show the dropdown when typing
  };

  // Handle adding a tag to the selection
  const handleTagSelect = (tag: Tag) => {
    if (!selectedTags.some((selected) => selected.id === tag.id)) {
      setSelectedTags((prevTags) => [...prevTags, tag]);
    }
    setIsDropdownOpen(false); // Close the dropdown after selecting
  };

  // Handle removing a tag from the selection
  const handleTagRemove = (tagId: number) => {
    setSelectedTags((prevTags) => prevTags.filter((tag) => tag.id !== tagId));
  };

  // Handle keyboard navigation (up, down, enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      // Move to next tag
      setHighlightedIndex((prevIndex) => {
        if (prevIndex === null || prevIndex === filteredTags.length - 1) {
          return 0;
        }
        return prevIndex + 1;
      });
    } else if (e.key === 'ArrowUp') {
      // Move to previous tag
      setHighlightedIndex((prevIndex) => {
        if (prevIndex === null || prevIndex === 0) {
          return filteredTags.length - 1;
        }
        return prevIndex - 1;
      });
    } else if (e.key === 'Enter' && highlightedIndex !== null) {
      // Select highlighted tag
      const tagToSelect = filteredTags[highlightedIndex];
      handleTagSelect(tagToSelect);
    }
  };

  // Group tags by their group
  const groupedTags: GroupedTags = filteredTags.reduce((groups: GroupedTags, tag: Tag) => {
    if (!groups[tag.group]) {
      groups[tag.group] = [];
    }
    groups[tag.group].push(tag);
    return groups;
  }, {});

  // Close the dropdown if the user clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false); // Close dropdown if clicking outside
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full">
      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search tags..."
        value={searchTerm}
        onChange={handleSearch}
        onFocus={() => setIsDropdownOpen(true)} // Open dropdown on focus
        onKeyDown={handleKeyDown} // Handle keyboard navigation
      />

      {/* Selected Tags (Pill Format) */}
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedTags.map((tag) => (
          <div key={tag.id} className="flex items-center space-x-2 bg-blue-200 text-blue-800 p-1 rounded-full">
            <span>{tag.name}</span>
            <button
              className="text-blue-600"
              onClick={() => handleTagRemove(tag.id)}
              aria-label={`Remove ${tag.name}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Filtered Tag List (Dropdown) */}
      {isDropdownOpen && (
        <div className="absolute w-full mt-1 max-h-60 overflow-y-auto border border-t-0 border-gray-300 rounded-md bg-white shadow-lg z-10">
          {Object.entries(groupedTags).map(([groupName, groupTags]) => (
            <div key={groupName}>
              <div className="bg-gray-100 p-2 font-semibold">{groupName}</div>
              <ul>
                {groupTags.map((tag, index) => {
                  const isHighlighted = highlightedIndex === index;
                  return (
                    <li
                      key={tag.id}
                      className={`px-2 py-1 cursor-pointer hover:bg-gray-200 ${
                        isHighlighted ? 'bg-blue-100' : ''
                      }`}
                      onClick={() => handleTagSelect(tag)}
                    >
                      {tag.name}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { TagPicker };
