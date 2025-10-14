import { computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { api } from 'boot/axios'
import { useAuth } from 'src/composables/auth/useAuth'
import { queryKeys } from 'src/utils/queryKeys'

// ========== FETCH AVATAR CATEGORIES ==========
export const useAvatarCategories = () => {
  return useQuery({
    queryKey: queryKeys.profile.categories(),
    queryFn: async () => {
      const response = await api.get('/profile/avatars/categories')
      return response.data.data // Extract the data array from the response
    },
    staleTime: 1000 * 60 * 60, // 1 hour (categories don't change often)
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
  })
}

// ========== FETCH AVATAR LIST BY CATEGORY ==========
export const useAvatarByCategory = (category) => {
  return useQuery({
    queryKey: queryKeys.profile.avatarList(category.value),
    queryFn: async () => {
      if (!category.value) return []
      const response = await api.get(`/profile/avatars/${category.value}`)
      return response.data.data // Extract the data array from the response
    },
    enabled: computed(() => !!category.value),
    staleTime: 1000 * 60 * 30, // 30 minutes
    cacheTime: 1000 * 60 * 60, // 1 hour
  })
}

// ========== UPDATE PROFILE SETTINGS ==========
export const useUpdateProfileSettings = () => {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data) => {
      try {
        const payload = {
          ...data,
          access_token: user.value.access_token,
        }

        console.log('Sending PUT request to /profile/settings:', payload)
        const response = await api.put('/profile/settings', payload)
        console.log('PUT response:', response)

        // Return the actual data, handle both response.data and response.data.data
        return response.data?.data || response.data
      } catch (error) {
        console.error('PUT /profile/settings error:', error)
        throw error
      }
    },
    onSuccess: (data) => {
      console.log('Profile update success, received data:', data)

      // Update profile data in cache if we have user data
      if (data?.user && user.value?.id) {
        const profileQueryKey = queryKeys.user.profile(user.value.id)

        console.log('Updating profile cache with key:', profileQueryKey)

        queryClient.setQueryData(
          profileQueryKey,
          (oldData) => {
            console.log('Current cache data:', oldData)

            // Handle case where oldData is undefined
            if (!oldData) {
              console.warn('No existing profile data in cache, creating new entry')
              return {
                user: data.user
              }
            }

            return {
              ...oldData,
              user: {
                ...oldData.user,
                ...data.user,
              },
            }
          }
        )

        // Update auth store if name was changed
        if (data.user.name) {
          user.value.name = data.user.name
        }

        console.log('Profile cache updated successfully')
      }

      // Invalidate and refetch profile data to ensure consistency
      if (user.value?.id) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.user.profile(user.value.id)
        })
      }
    },
    onError: (error) => {
      console.error('Profile update mutation error:', error)
    }
  })
}

// ========== CHANGE PASSWORD ==========
export const useChangePassword = () => {
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data) => {
      try {
        const payload = {
          ...data,
          access_token: user.value.access_token,
        }

        console.log('Sending PUT request to /profile/change-password:', payload)
        const response = await api.put('/profile/change-password', payload)
        console.log('PUT change-password response:', response)

        // Return the actual data, handle both response.data and response.data.data
        return response.data?.data || response.data
      } catch (error) {
        console.error('PUT /profile/change-password error:', error)
        throw error
      }
    },
    onError: (error) => {
      console.error('Change password mutation error:', error)
    }
  })
}
