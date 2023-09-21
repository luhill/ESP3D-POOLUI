/*
Temperatures.js - ESP3D WebUI component file

 Copyright (c) 2021 Luc LEBOSSE. All rights reserved.

 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU Lesser General Public
 License as published by the Free Software Foundation; either
 version 2.1 of the License, or (at your option) any later version.
 This code is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 Lesser General Public License for more details.
 You should have received a copy of the GNU Lesser General Public
 License along with This code; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

import { Fragment, h } from "preact"
import { T } from "../Translations"
import { useUiContext, useUiContextFn } from "../../contexts"
import { useState } from "preact/hooks"
import { ButtonImg, Loading, Field } from "../Controls"
import { useHttpFn } from "../../hooks"
import { espHttpURL } from "../Helpers"
import { Sliders, Power, Send } from "preact-feather"
import { useTargetContext } from "../../targets"
import { Input } from "../Controls/Fields"



//A separate control to avoid the full panel to be updated when the temperatures are updated
const MyControls = () => {
    const { myPanel } = useTargetContext();
    const { toasts } = useUiContext()
    const { createNewRequest } = useHttpFn


    const sendCommand = (command) => {
        createNewRequest(
            espHttpURL("command", { cmd: command }),
            { method: "GET", echo: command }, {
            onSuccess: (result) => { },
            onFail: (error) => {
                toasts.addToast({ content: error, type: "error" })
                console.log(error)
            },
        }
        )
    }
    const ui = myPanel.ui
    const values = myPanel.values

    const toolCmd = (key) => {
        let vals = values[key]
        if(Array.isArray(vals)){
            return ui[key].cmd + ' [' + vals.toString()+']'
        }else{
            return ui[key].cmd + ' ' + vals
        }
    }
    const setVal = (key, val) => {
        if (val != null) {//values null on start
            if (val == true || val == false) {
                val += 0//cast to integer
                //for switches handle the send command directly
                //sendCommand(ui[key].cmd + ' ' + val)
                sendCommand(toolCmd(key))
            }
            values[key] = val
            console.log(key + ":" + val)
        }
    }
    
    const controlForTool = (tool) => {
        switch (ui[tool].type) {
            case "onDuty"://switch, 0-100%input, send button
                return (
                    <div class="extra-ctrls-container m-1">
                        <div class="extra-ctrls-container2">
                            <div>
                                {ui[tool].label}
                            </div>
                            <div class="m-1" />
                            <div>
                                <Field
                                    type="boolean"
                                    value={values[tool][0]}
                                    id={'switch' + tool}
                                    setValue={(val, update) => {
                                        if (val == null) return
                                        myPanel.values[tool][0] = val + 0/*(cast to int*/
                                        sendCommand(toolCmd(tool))
                                    }}
                                />
                            </div>
                            <div class="m-1" />
                            <div>
                                <Field
                                    type="number"
                                    value={values[tool][1]}
                                    append="%"
                                    style="width: 3rem"
                                    setValue={(val, update) => {
                                        if (val == null) return
                                        myPanel.values[tool][1] = val
                                    }}
                                />
                            </div>
                            {mySendButton(tool)}
                        </div>
                    </div>
                )
                break;
            case "onStartStop"://switch, start time, stop time, send button
                return (
                    <div class="extra-ctrls-container m-1">
                        <div class="extra-ctrls-container2">
                            <div>
                                {ui[tool].label}
                            </div>
                            <div class="m-1" />
                            <div>
                                <Field
                                    type="boolean"
                                    value={values[tool][0]}
                                    id={'switch' + tool}
                                    setValue={(val, update) => {
                                        if (val == null) return
                                        myPanel.values[tool][0] = val + 0/*(cast to int*/
                                        sendCommand(toolCmd(tool))
                                    }}
                                />
                            </div>
                            <div>
                                <Field
                                    type="time"
                                    step="60"
                                    style="width: 6rem"
                                    value={new Date(values[tool][1] * 1000).toISOString().substring(11, 16)}
                                    id={'tStart' + tool}
                                    setValue={(val, update) => {
                                        if (val == null) return
                                        let sec = val.split(':'); // split it at the colons
                                        myPanel.values[tool][1] = sec[0] * 3600 + sec[1] * 60
                                    }}
                                />
                            </div>
                            <div class="m-1" />
                            <div>
                                <Field
                                    type="time"
                                    step="60"
                                    style="width: 6rem"
                                    value={new Date(values[tool][2] * 1000).toISOString().substring(11, 16)}
                                    setValue={(val, update) => {
                                        if (val == null) return
                                        let sec = val.split(':'); // split it at the colons
                                        myPanel.values[tool][2] = sec[0] * 3600 + sec[1] * 60
                                    }}
                                />
                            </div>
                            {mySendButton(tool)}
                        </div>
                    </div>
                )
                break;
            case "boolean"://switch
                return (
                    <div>
                        {defaultControl(tool)}
                    </div>
                )
                break;
            case "datetime-local"://current time, send button
                return (
                    <div>
                        {defaultControl(tool, true, "width: 12rem")}
                    </div>
                )
                break;
            case "number"://number, send button
                return (
                    <div>
                        {defaultControl(tool, true, "width: 3.75rem")}
                    </div>
                )
                break;
            default:
                //return(<div>{defaultControl(tool)}{mySendButton(tool)}</div>)
                return (
                    <div>
                        {defaultControl(tool, true)}
                    </div>
                )
                break;
        }
    }
    const mySendButton = (tool) => {
        return (
            <ButtonImg
                id={"btn-send" + tool}
                icon={<Send />}
                tooltip
                data-tooltip={"set value"}
                onClick={(e) => {
                    useUiContextFn.haptic()
                    e.target.blur()
                    sendCommand(toolCmd(tool))
                }}
            />
        )
    }
    const defaultControl = (tool, hasButton = false, cStyle) => {
        return (
            <div class="extra-ctrls-container m-1">
                <div class="extra-ctrls-container2">
                    <div>
                        {ui[tool].label}
                    </div>
                    <div class="m-1" />
                    <div>
                        <Field
                            type={ui[tool].type}
                            value={values[tool]}
                            append={ui[tool].append}
                            style={cStyle}
                            setValue={(val, update) => { setVal(tool, val) }}
                        />
                    </div>
                    {hasButton ? mySendButton(tool) : ""}
                </div>
            </div>
        )
    }

    return (
        <div class="myPanel-ctrls">
            {Object.keys(ui).map((tool) => {
                return (controlForTool(tool))
            })}
        </div>
    )
}

const MyPanel = () => {
    const { panels } = useUiContext()
    const { myPanel } = useTargetContext()
    const { createNewRequest } = useHttpFn

    const sendCommand = (command) => {
        createNewRequest(
            espHttpURL("command", { cmd: command }),
            { method: "GET", echo: command }, {
            onSuccess: (result) => { },
            onFail: (error) => {
                toasts.addToast({ content: error, type: "error" })
                console.log(error)
            },
        }
        )
    }
    
    const ready = myPanel.ui != null

    if (!myPanel.loaded) {//short delay to let serial setup complete
        setTimeout(function() {
            sendCommand("P114")
            sendCommand("P113")
        }, 500);
        
        myPanel.loaded = true;
    }
    return (
        <div class="panel panel-dashboard">
            <div class="navbar">
                <span class="navbar-section feather-icon-container">
                    <Sliders />
                    <strong class="text-ellipsis">{myPanel.name}</strong>
                </span>
                <span class="navbar-section">
                    <span style="height: 100%;">
                        <button
                            class="btn btn-clear btn-close m-1"
                            aria-label="Close"
                            onclick={(e) => {
                                useUiContextFn.haptic()
                                panels.hide(MyPanelElement.id)
                            }}
                        />
                    </span>
                </span>
            </div>
            <div class="panel-body panel-body-dashboard">
                {ready && (
                    <div class="myPanel-container">
                        <MyControls />
                    </div>
                )}
                {!ready && (
                    <div class="loading-panel">
                        <div class="m-2">
                            <div class="m-1">{"Connecting..."}</div>
                            <Loading />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

const MyPanelElement = {
    id: "myPanel",
    content: <MyPanel />,
    name: "My Panel",
    icon: "Sliders",
    show: "showMyPanel",
    onstart: "openMyPanelOnStart",
    settingid: "My Panel",
    loaded: false
}

export { MyPanel, MyPanelElement, MyControls }
