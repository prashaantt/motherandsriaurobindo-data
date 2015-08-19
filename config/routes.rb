Incarnateword::Application.routes.draw do
  class DoclistConstraints
    def matches?(params)
      a = b = c = d = true
      a_name = a_year = name_used = false
      if !!(/^m$|^sa$/).match(params[:a])
        a_name = true
      elsif !!(/^\d{4}$/.match(params[:a])) && params[:a].to_i.between?(
        1872, 1973)
        a_year = true
      end
      a = a_name || a_year
      if params[:b]
        b = (!!(/^\d|\d{2}$/.match(params[:b])) && params[:b].to_i.between?(
          1, 12)) || !a_name && !!(/^m$|^sa$/).match(params[:b]) ? true : false
        if params[:c]
          c = (!!(/^\d{2}$/.match(params[:c])) && params[:c].to_i.between?(
            1, 31)) || !a_name && !!(/^m$|^sa$/).match(
              params[:c]) ? true : false
          if params[:d]
            d = !!(/^m$|^sa$/.match(params[:d])) && !a_name
          end
        end
      end
      a && b && c && d
    end
  end

  class CompilationConcordanceConstraints
    def matches?(params)
      if params.subdomain.empty? || params.subdomain == 'www'
        compilation = alpha = true
        compilations = %w(sabcl cwsa arya cwm cwmfr agenda agendafr)
        unless compilations.include?(params[:compilation])
          return false
        end
        if params[:a]
          return params[:a].match(/[a-z&]/)
        end
        true
      else
        false
      end
    end
  end

  class CompilationConstraints
    def matches?(params)
      if params.subdomain.empty? || params.subdomain == 'www'
        compilation = volume = alpha = true
        compilations = %w(sabcl cwsa arya cwm cwmfr agenda agendafr)
        unless compilations.include?(params[:compilation])
          return false
        end
        if params[:volume]
          volume = (!!(/^\d|\d{2}$/.match(params[:volume])) && params[:volume].to_i.between?(
            1, 37)) ? true : false
        end
        if params[:a]
          alpha = params[:a].match(/[a-z&]/)
        end
        return compilation && volume && alpha
      else
        false
      end
    end
  end

  class AuthorConstraints
    def matches?(params)
      if params.subdomain.empty? || params.subdomain == 'www'
        authors = %w(sa m)
        return true if authors.include?(params[:author])
        return false
      else
        false
      end
    end
  end

  get '/auth/:provider/callback', to: 'sessions#create'
  get '/signout', to: 'sessions#destroy', as: 'signout'

  # override dictionary-specific subdomain routes
  get '/' => 'entries#index', constraints: { subdomain: 'dictionary' }, as: 'dictionary'
  get '/entries', to: 'entries#index', constraints: { subdomain: 'dictionary' }
  #get '/entries/:id', to: 'entries#show', constraints: { subdomain: 'dictionary' }
  get '/:id', to: 'entries#show', constraints: { subdomain: 'dictionary' }, as: 'dictionary_entry'

  get '/:author', to: 'authors#show', constraints: AuthorConstraints.new

  # get '/:a', to: 'doclist#index', constraints: DoclistConstraints.new
  # get '/:a/:b', to: 'doclist#index', constraints: DoclistConstraints.new
  # get '/:a/:b/:c', to: 'doclist#index', constraints: DoclistConstraints.new
  # get '/:a/:b/:c/:d', to: 'doclist#index', constraints: DoclistConstraints.new

  resources :entries, :books, :chapters, :home, :quotes

  get '/:compilation', to: 'compilations#show', constraints: CompilationConstraints.new
  get '/:compilation/concordance', to: 'compilations#concordance', constraints: CompilationConcordanceConstraints.new
  get '/:compilation/concordance/:a', to: 'compilations#concordance_alpha', constraints: CompilationConcordanceConstraints.new

  get '/:compilation/:volume', to: 'volumes#show', constraints: CompilationConstraints.new, as: 'compilation_vol'
  get '/:compilation/:volume/concordance', to: 'volumes#concordance', constraints: CompilationConstraints.new
  get '/:compilation/:volume/concordance/:a', to: 'volumes#concordance_alpha', constraints: CompilationConstraints.new
  get '/:compilation/:volume/:url', to: 'chapters#show', constraints: CompilationConstraints.new, as: 'compilation_chapter'

  get '/get_asset_digest', to: 'digests#get'
  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  root to: "home#index"

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase


  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
