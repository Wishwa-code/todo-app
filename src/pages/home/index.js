import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { LogoutOutlined } from '@ant-design/icons';



// Define the API base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Create an axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
});



const TaskPopup = ({ task, onClose, onEdit, isNew = false, setIsPopupOpen }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState(task || { text: '', description: '', completed: false });
    const popupRef = useRef(null);
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [taskStatus, setTaskStatus] = useState(task?.status || 'Pending');
    const [dueDate, setDueDate] = useState(task?.dueDate ? new Date(task.dueDate) : null);

    console.log(task);
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
          onClose();
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [onClose]);

    useEffect(() => {
      setIsPopupOpen(true);
      return () => setIsPopupOpen(false);
    }, [setIsPopupOpen]);
  
  
    const handleSave = async () => {
      try {
        const updatedTask = { ...editedTask, status: taskStatus , dueDate: dueDate};
        await onEdit(updatedTask);
        setIsEditing(false);
      } catch (error) {
        console.error('Error saving task:', error);
        // Handle error (e.g., show error message to user)
      }
    };

    useEffect(() => {
        if (isNew) {
          setIsEditing(true); // Set isEditing to true when it's a new task
        }
      }, [isNew]);

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const options = { weekday: 'short', day: 'numeric', month: 'short' };
      return date.toLocaleDateString('en-US', options).replace(/(\w+)\s(\d+)\s(\w+)/, (_, weekday, day, month) => 
        `${weekday}, ${day} ${month.toLowerCase()}`
      );
    };  

    const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
        case 'pending':
          return 'bg-yellow-200 text-yellow-800';
        case 'completed':
          return 'bg-green-200 text-green-800';
        case 'overdue':
          return 'bg-red-200 text-red-800';
        case 'upcoming':
          return 'bg-blue-200 text-blue-800';
        default:
          return 'bg-gray-200 text-gray-800';
      }
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div ref={popupRef} className="bg-black bg-opacity-70 text-white p-6 rounded-lg w-2/5 drop-shadow-md">
            {isNew || task ? ( // Check if isNew or task exists\
                isEditing ? (
                    <>
                        <input
                            type="text"
                            value={editedTask.text}
                            onChange={(e) => setEditedTask({ ...editedTask, text: e.target.value })}
                            className="w-full bg-gray-800 text-white p-2 rounded mb-2"
                        />
                        <textarea
                            value={editedTask.description || ''}
                            onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                            className="w-full bg-gray-800 text-white p-2 rounded mb-2"
                            rows="3"
                        />
                        <div className="flex justify-between items-center">
                            <select
                                value={taskStatus}
                                onChange={(e) => setTaskStatus(e.target.value)}
                                className="bg-yellow-300 text-yellow-800 px-2 py-1 rounded"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Overdue">Overdue</option>
                                <option value="Completed">Completed</option>
                                <option value="Upcoming">Upcoming</option>
                            </select>
                            <DatePicker
                                selected={dueDate}
                                onChange={(date) => setDueDate(date)}
                                showTimeSelect
                                timeFormat="HH:mm"
                                timeIntervals={15}
                                timeCaption="Time"
                                dateFormat="MMMM d, yyyy h:mm aa"
                                className="bg-gray-800 text-white p-2 rounded cursor-pointer"
                                placeholderText="Select due date and time"
                                popperClassName="react-datepicker-right"
                                popperPlacement="bottom-end"
                                customInput={
                                  <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300">
                                    {dueDate ? dueDate.toLocaleString() : 'Set Due Date'}
                                  </button>
                                }
                              />
                        </div>
                    </>
                ) : (
                    <> 
                        <div className="flex flex-col ">
                          <div className="flex flex-row justify-between	">
                            <div className="flex flex-row">
                              <h2 className="text-2xl font-bold mb-2">{task.text}</h2>
                              <h4 className={`my-auto px-2 py-1  ml-4 rounded-3xl text-sm font-semibold ${getStatusColor(taskStatus)}`}>
                                  {taskStatus}
                              </h4>
                            </div>
                            
                            <h4 className="">{formatDate(dueDate)}</h4>
                          </div>
                            <p className="mt-4 mb-4 text-left">{task.description || 'This is the description of the final tasks. This is the description of the final tasks This is the description of the final tasks This'}</p>
                            
                        </div>
                    </>
                )
            ) : (
                <p>Loading task...</p> // Or any suitable message
            )}

            
            <div className="mt-4 flex justify-between">
                {isEditing ? (
                    <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded">
                        {isNew ? 'Add Task' : 'Save Changes'}
                    </button>
                ) : (
                    <button onClick={() => setIsEditing(true)} className="bg-blue-500 text-white px-4 py-2 rounded">Edit</button>
                )}
                <button onClick={onClose} className="bg-white text-black px-4 py-2 rounded">Close</button>
            </div>
        </div>
      </div>
    );
  };

const DashboardPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [selectedTask, setSelectedTask] = useState(null);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [userName, setUserName] = useState();



  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchTasks();
    fetchBackgroundImage();
    fetchQuote();
    return () => clearInterval(timer);
  }, []);

  const fetchBackgroundImage = async () => {
    try {
      const response = await axios.get('https://api.unsplash.com/photos/random?query=sunset&client_id=GkhuiveA_tnwGApEcFQEEAkrRKL2TzG50uYA4gSbEUU');
      setBackgroundImage(response.data.urls.regular);
    } catch (error) {
      console.error('Error fetching background image:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userInfo'); 
    window.location.href = '/'; 
  };

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/tasks');
      console.log(response.data)
      setTasks(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      const userInfo = JSON.parse(storedUserInfo);
      setUserName(userInfo.name || 'Guest');
    }
  }, []);

  const fetchQuote = async () => {
    try {
      const response = await axios.get('https://api.quotable.io/random');
      setQuote({ text: response.data.content, author: response.data.author });
    } catch (error) {
      console.error('Error fetching quote:', error);
    }
  };

  const handleEditTask = async (editedTask) => {
    try {
      if (editedTask.id) {
        console.log(editedTask);
        // Editing existing task
        await api.put(`/tasks/${editedTask.id}`, editedTask);
      } else {
        // Adding new task
        console.log(editedTask);

        await api.post('/tasks', editedTask);
      }
      await fetchTasks(); // Refresh the task list
      setSelectedTask(null);
      setIsAddingTask(false);
    } catch (error) {
      console.error('Error editing/adding task:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  const toggleTask = async (id) => {
    try {
      const taskToToggle = tasks.find(task => task.id === id);
      const updatedTask = { ...taskToToggle, completed: !taskToToggle.completed };
      await api.put(`/tasks/${id}`, updatedTask);
      await fetchTasks(); // Refresh the task list
    } catch (error) {
      console.error('Error toggling task:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      await fetchTasks(); // Refresh the task list
    } catch (error) {
      console.error('Error deleting task:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  const visibleTasks = showAllTasks ? tasks : tasks.slice(0, 3);

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center relative"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="text-white text-center w-2/5 mx-auto">
        <div class="py-2 absolute top-10 right-10">
            <button onClick={handleLogout} className="">
              <LogoutOutlined className="" />
            </button>
        </div>
        <h1 className="text-6xl font-bold mb-4">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </h1>
        <h2 className="text-3xl mb-8">Good evening,{userName}</h2>
        <div className="bg-black bg-opacity-50 rounded-lg p-6">
          
          {visibleTasks.map(task => (
            <div 
              key={task.id} 
              className="flex items-center mb-4 relative cursor-pointer"
              onMouseEnter={() => setHoveredTask(task.id)}
              onMouseLeave={() => setHoveredTask(null)}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleTask(task.id);
                }}
                className="mr-3"
              />
              <span 
                className={task.completed ? 'line-through' : ''}
                onClick={() => setSelectedTask(task)}
              >
                {task.text}
              </span>
              {hoveredTask === task.id && (
                <button 
                  className="absolute right-0 bg-red-500 text-white px-2 py-1 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
          <button 
            className="mt-4 text-sm underline"
            onClick={() => setShowAllTasks(!showAllTasks)}
          >
            {showAllTasks ? 'Show less' : 'Show more'}
          </button>
          
        </div>
        <div>
        <button 
            className="mt-4 ml-4 bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => setIsAddingTask(true)}
          >
            Add Task
          </button>
        </div>

        <div className="mt-8 p-4 rounded-lg">
          <p className="italic">"{quote.text}"</p>
          <p className="mt-2">- {quote.author}</p>
        </div>
      </div>
      {(selectedTask || isAddingTask) && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-filter backdrop-blur-sm z-10"></div>
      )}
      {selectedTask && (
        <TaskPopup 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onEdit={handleEditTask}
          setIsPopupOpen={setIsPopupOpen}

        />
      )}
      {isAddingTask && (
        <TaskPopup 
          onClose={() => setIsAddingTask(false)} 
          onEdit={handleEditTask}
          isNew={true}
          task={{ text: "", description: "", completed: false }} // Empty task object
          setIsPopupOpen={setIsPopupOpen}

        />
      )}
    </div>
  );
};

export default DashboardPage;