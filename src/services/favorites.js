import axios from 'axios';
const baseUrl = '/api/favs'

const getAll = async () => {
    const res = await axios.get(baseUrl)
    return res.data
}

const create = async (newObject) => {
    const res = await axios.post(baseUrl, newObject)
    return res.data;
}

const update = async (id, newObject) => {
    const res = await axios.put(`${baseUrl}/${id}`, newObject)
    return res.data
}

const remove = async (id) => {
    await axios.delete(`${baseUrl}/${id}`)
}

export default {getAll, create, update, remove}