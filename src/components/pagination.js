import React from 'react'
import { Button } from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'

export default function Pagination() {
    return (
        <div style={{
            textAlign:'center',
            marginTop: '8px',
            marginBottom: '16px',
        }}>
            <Button icon={<LeftOutlined/>}/>
            <Button icon={<RightOutlined/>}/>
        </div>
    )
}
