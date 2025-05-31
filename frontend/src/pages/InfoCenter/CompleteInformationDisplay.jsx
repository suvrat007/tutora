

import React from 'react'
import Sidebar from '../Navbar/SideBar'
import Navbar from '../Navbar/Navbar'

const CompleteInformationDisplay = () => {
  return (
    <div className='flex h-screen'>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className='flex flex-col flex-1'>
        <Navbar />

        <div className='flex flex-col flex-1 p-4 gap-4'>
          {/* Top section */}
          <div className='grid grid-cols-3 gap-4 flex-1'>
            <div className='col-span-2'>
              <div className='border-4 rounded-3xl p-2 h-full'>
                <div className='grid grid-cols-2 gap-2 h-full'>
                  <div className='bg-white rounded-2xl shadow border p-4'>Panel 1</div>
                  <div className='bg-white rounded-2xl shadow border p-4'>Panel 2</div>
                </div>
              </div>
            </div>
            <div className='rounded-[25px] border-4 border-black p-6 flex items-center justify-center h-full'>
              <div className='w-24 h-24 rounded-full border-2 border-black flex items-center justify-center'>
                <span>👤</span>
              </div>
            </div>
          </div>

          {/* Attendance section - One outer box */}
          <div className='flex h-[280px] border-4 border-black rounded-[25px] px-3 py-2 gap-3'>
            {/* Attendance Percentage - a bit smaller */}
            <div className='w-[35%] bg-white rounded-[20px] border-2 border-black p-3'>
              <h3 className='font-bold mb-2'>Attendance Percentage</h3>
              {/* Percentage Chart Placeholder */}
            </div>

            {/* Attendance Table - fills remaining space */}
            <div className='flex-1 bg-white rounded-[20px] border-2 border-black p-3 overflow-auto'>
              <h3 className='font-bold mb-2'>Attendance Table</h3>
              <div className='overflow-x-auto'>
                <table className='table-auto w-full text-left'>
                  <thead className='border-b-2 border-black'>
                    <tr>
                      <th>Dates</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Order By</th>
                      <th>Filter By</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>01/05/25</td>
                      <td>Math</td>
                      <td>Present</td>
                      <td>
                        <select>
                          <option>Present</option>
                          <option>Absent</option>
                          <option>Subject</option>
                        </select>
                      </td>
                      <td>
                        <select>
                          <option>Presence</option>
                          <option>Absence</option>
                          <option>All</option>
                        </select>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default CompleteInformationDisplay



