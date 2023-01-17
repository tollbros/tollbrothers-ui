import React, { useState, useEffect } from 'react'
import styles from './ChatButton.module.scss'
import Script from 'next/script'

/**
 * @param handleOffline
 * @param handleEvent
 * @param id
 * @param jde
 * @returns {JSX.Element}
 * @constructor
 */
export const ChatButton = ({ handleOffline, handleEvent, id, jde }) => {
  const [chat, setChat] = useState(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!isReady) return
    startChat()
  }, [isReady])

  const startChat = async () => {
    if (typeof window === 'undefined' || !window?.embedded_svc) {
      console.log('no embedded_svc')
      setChat(null)
      return
    }

    if (!jde || !id) {
      console.error('startChat... Missing required parameters.')
      setChat(null)
      return
    }

    try {
      const response = await fetch(
        `https://6kodci7q0f.execute-api.us-east-1.amazonaws.com/Prod/chatstatus?chatId=${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          }
        }
      )
      const chat = await response.json()
      setChat(chat)
    } catch (error) {
      console.log('chat script loading error: ')
      console.log(error)
    }
  }

  if (window?.embedded_svc) {
    if (!window.embedded_svc.settings || !jde) {
      console.error('getCustomSettings... Missing required parameters')
      return
    }
    // window.embedded_svc.settings.displayHelpButton = false
    // window.embedded_svc.settings.defaultMinimizedText = 'Online Sales Team' // (Defaults to Chat with an Expert)
    // window.embedded_svc.settings.disabledMinimizedText = 'Online Sales Team' // (Defaults to Agent Offline)
    // window.embedded_svc.settings.loadingText = 'Online Sales Team' // (Defaults to Loading)
    // window.embedded_svc.settings.prepopulatedPrechatFields.Company = 'n/a'
    // window.embedded_svc.settings.extraPrechatFormDetails = [
    //   {
    //     label: 'JDE',
    //     value: jde,
    //     displayToAgent: true,
    //     transcriptFields: ['jde_number__c']
    //   },
    //   {
    //     label: 'First Name',
    //     displayToAgent: true,
    //     transcriptFields: ['First_Name__c']
    //   },
    //   {
    //     label: 'Last Name',
    //     displayToAgent: true,
    //     transcriptFields: ['Last_Name__c']
    //   },
    //   {
    //     label: 'Email',
    //     displayToAgent: true,
    //     transcriptFields: ['Email__c']
    //   }
    // ]
    // window.embedded_svc.settings.extraPrechatInfo = [
    //   {
    //     entityFieldMaps: [
    //       {
    //         doCreate: false,
    //         doFind: false,
    //         fieldName: 'LastName',
    //         isExactMatch: false,
    //         label: 'Last Name'
    //       },
    //       {
    //         doCreate: false,
    //         doFind: false,
    //         fieldName: 'FirstName',
    //         isExactMatch: false,
    //         label: 'First Name'
    //       },
    //       {
    //         doCreate: false,
    //         doFind: true,
    //         fieldName: 'Email',
    //         isExactMatch: true,
    //         label: 'Email'
    //       }
    //     ],
    //     entityName: 'Contact'
    //   },
    //   {
    //     entityFieldMaps: [
    //       {
    //         doCreate: true,
    //         doFind: false,
    //         fieldName: 'LastName',
    //         isExactMatch: false,
    //         label: 'Last Name'
    //       },
    //       {
    //         doCreate: true,
    //         doFind: false,
    //         fieldName: 'FirstName',
    //         isExactMatch: false,
    //         label: 'First Name'
    //       },
    //       {
    //         doCreate: true,
    //         doFind: true,
    //         fieldName: 'Email',
    //         isExactMatch: true,
    //         label: 'Email'
    //       }
    //     ],
    //     entityName: 'Lead'
    //   }
    // ]
    // window.embedded_svc.settings.enabledFeatures = ['LiveAgent']
    // window.embedded_svc.settings.entryFeature = 'LiveAgent'

    const addEventHandler = (eventType, callback) => {
      window.embedded_svc.addEventHandler(eventType, callback)
    }

    const eventTypes = [
      'afterMaximize',
      'afterMinimize',
      'afterDestroy',
      'onChatEndedByChasitor',
      'onChatEndedByAgent',
      'onIdleTimeoutOccurred',
      'onAgentMessage'
    ]

    eventTypes.forEach((eventType) => {
      console.log('adding event ' + eventType)
      addEventHandler(eventType, () => {
        handleEvent(eventType)
      })
    })

    window.embedded_svc.init(
      'https://tollbros.my.salesforce.com',
      'https://tollbrothers.force.com/campaignmarketplace',
      'https://service.force.com',
      '00D36000001HM6g',
      'OSC_Pennsylvania_Midwest',
      {
        baseLiveAgentContentURL:
          'https://c.la1-c1-ia5.salesforceliveagent.com/content',
        deploymentId: '5723q000000NXMb',
        buttonId: '5733q000000Na25',
        baseLiveAgentURL: 'https://d.la1-c1-ia5.salesforceliveagent.com/chat',
        eswLiveAgentDevName: 'OSC_Pennsylvania_Midwest',
        isOfflineSupportEnabled: false
      }
    )
  }

  const onClick = () => {
    console.log('chat.status', chat?.status)
    if (chat?.status !== 'online') {
      handleOffline()
      return
    }

    window.embedded_svc.onHelpButtonClick()
  }

  return (
    <button className={styles.chatButton} onClick={onClick}>
      <Script
        src='https://tollbros.my.salesforce.com/embeddedservice/5.0/esw.min.js'
        async
        onLoad={async () => {
          setIsReady(true)
        }}
      />
      <div
        className={`${styles.statusDot} ${
          chat?.status === 'online' ? styles.online : styles.offline
        }`}
      />
      Chat
    </button>
  )
}
