import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    user: null,
    token: null
}

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {}
})